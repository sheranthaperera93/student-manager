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

  async findById(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

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

  async handleUploadProcess(
    file: Express.Multer.File,
  ): Promise<{ fileName: string; filePath: string }> {
    Logger.log('Uploading file to local storage');
    const { fileName, filePath } = await this.uploadFile(file);

    await this.sendUploadJob(filePath, fileName);
    return { filePath, fileName };
  }

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
