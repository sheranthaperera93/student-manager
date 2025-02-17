import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UpdateUserInput } from './models/update-user.model';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { PaginatedUsers } from './models/paginated-users.model';
import { CustomException } from 'src/core/custom-exception';
import { ProducerService } from 'src/kafka/producer/producer.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly kafka: ProducerService,
  ) {}

  /**
   * Retrieves a paginated list of users.
   *
   * @param {Object} params - The parameters for pagination.
   * @param {number} [params.skip] - The number of records to skip.
   * @param {number} [params.take] - The number of records to take.
   * @returns {Promise<PaginatedUsers>} A promise that resolves to a paginated list of users.
   */
  async findAll({
    skip,
    take,
  }: {
    skip?: number;
    take?: number;
  }): Promise<PaginatedUsers> {
    const [items, total] = await this.userRepository.findAndCount({
      order: {
        id: 'ASC',
      },
      skip,
      take,
    });
    return { items, total };
  }

  /**
   * Finds a user by their unique identifier.
   *
   * @param id - The unique identifier of the user.
   * @returns A promise that resolves to the user with the given id.
   */
  async findById(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  /**
   * Updates a user with the given ID using the provided updateUserInput.
   *
   * @param {number} id - The ID of the user to update.
   * @param {UpdateUserInput} updateUserInput - The input data to update the user with.
   * @returns {Promise<string>} - A promise that resolves to a success message if the update is successful.
   * @throws {CustomException} - Throws an exception if the user is not found or if the update fails.
   */
  async update(id: number, updateUserInput: UpdateUserInput): Promise<string> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new CustomException(
          'User not found',
          1004,
          {},
          HttpStatus.BAD_REQUEST,
        );
      }
      Object.assign(user, updateUserInput);
      await this.userRepository.update({ id: user.id }, user);
      return 'User updated successfully';
    } catch (error) {
      throw new CustomException(
        'User update failed',
        1004,
        error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Deletes a user by their ID.
   *
   * @param {number} id - The ID of the user to delete.
   * @returns {Promise<string>} A promise that resolves to a success message if the user is deleted.
   * @throws {CustomException} If the user is not found or if the deletion fails.
   */
  async delete(id: number): Promise<string> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new CustomException(
          'User not found',
          1004,
          {},
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.userRepository.delete({ id });
      return 'User deleted successfully';
    } catch (error) {
      throw new CustomException(
        'User delete failed',
        1004,
        error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Creates multiple user records in bulk.
   *
   * @param {User[]} userRecords - An array of user records to be created.
   * @returns {Promise<string>} A promise that resolves to a success message if the users are created successfully.
   * @throws {CustomException} Throws a CustomException if the bulk user creation fails.
   */
  async createBulk(userRecords: User[]) {
    try {
      await this.userRepository.save(userRecords);
      return 'Users created successfully';
    } catch (error) {
      throw new CustomException(
        'Bulk user creation failed',
        1008,
        error,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Handles the process of uploading a file.
   *
   * @param file - The file to be uploaded.
   * @returns A promise that resolves to an object containing the file name and file path.
   */
  async handleUploadProcess(
    file: Express.Multer.File,
  ): Promise<{ fileName: string; filePath: string }> {
    Logger.log('Uploading file to local storage');
    const { fileName, filePath } = await this.uploadFile(file);

    await this.sendUploadJob(filePath, fileName);
    return { filePath, fileName };
  }

  /**
   * Uploads a file to the server.
   *
   * @param {Express.Multer.File} file - The file to be uploaded.
   * @returns {Promise<{ fileName: string; filePath: string }>} A promise that resolves with the file name and file path.
   * @throws {CustomException} Throws a custom exception if the file upload fails.
   */
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ fileName: string; filePath: string }> {
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    if (!existsSync(join(__dirname, '../', 'uploads'))) {
      mkdirSync(join(__dirname, '../', 'uploads'));
    }
    const filePath = join(__dirname, '../', 'uploads', fileName);

    return await new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      writeStream.write(file.buffer);
      writeStream.end();
      writeStream.on('finish', () => resolve({ fileName, filePath }));
      writeStream.on('error', (error) =>
        reject(
          new CustomException(
            'Failed on file upload',
            1005,
            error,
            HttpStatus.BAD_REQUEST,
          ),
        ),
      );
    });
  }

  /**
   * Sends an upload job to the job queue service.
   *
   * @param filePath - The path of the file to be uploaded.
   * @param fileName - The name of the file to be uploaded.
   * @returns A promise that resolves when the job has been sent to the queue.
   */
  async sendUploadJob(filePath: string, fileName: string) {
    const payload = {
      filePath,
      fileName,
      action: 'upload',
    };
    Logger.log(
      'Sending upload job details to job queue service with payload',
      payload,
    );
    await this.kafka.produce({
      topic: 'user-upload-queue',
      messages: [{ key: 'bulk-insert', value: JSON.stringify(payload) }],
    });
  }

  /**
   * Retrieves the file path for a given file name.
   * 
   * @param fileName - The name of the file to retrieve.
   * @returns The file path of the requested file.
   * @throws CustomException if the file does not exist.
   */
  getFile(fileName: string): string {
    Logger.log('fileName', fileName);
    const filePath = join(__dirname, '../', 'uploads', fileName);
    if (!existsSync(filePath)) {
      throw new CustomException(
        'File not found',
        1006,
        {},
        HttpStatus.NOT_FOUND,
      );
    }
    return filePath;
  }
}
