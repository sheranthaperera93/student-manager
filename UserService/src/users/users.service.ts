import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { createWriteStream, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as archiver from 'archiver';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { PaginatedUsers } from './models/paginated-users.model';
import { CustomException, DuplicateEntryException } from 'src/core/exception-handlers';
import { ProducerService } from 'src/kafka/producer/producer.service';
import { UserInputDTO } from './models/user-input.dto';
import { DateOfBirthRangeInput } from './models/date-of-birth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly kafka: ProducerService,
  ) {}

  findAll = async ({
    skip,
    take,
    dateOfBirth,
  }: {
    skip?: number;
    take?: number;
    dateOfBirth?: DateOfBirthRangeInput;
  }): Promise<PaginatedUsers> => {
    const query = this.userRepository.createQueryBuilder('user');
    if (dateOfBirth) {
      if (dateOfBirth.from) {
        query.andWhere('user.date_of_birth >= :from', {
          from: dateOfBirth.from,
        });
      }
      if (dateOfBirth.to) {
        query.andWhere('user.date_of_birth <= :to', { to: dateOfBirth.to });
      }
    }

    if (skip !== undefined) {
      query.skip(skip);
    }

    if (take !== undefined) {
      query.take(take);
    }

    query.orderBy('user.id', 'ASC');

    const [items, total] = await query.getManyAndCount();
    return { items, total };
  };

  findById = async (id: number): Promise<User> => {
    return this.userRepository.findOneByOrFail({ id });
  };

  update = async (
    id: number,
    updateUserInput: UserInputDTO,
  ): Promise<string> => {
    try {
      const user = await this.findById(id);
      Object.assign(user, updateUserInput);
      await this.userRepository.update({ id: user.id }, user);
      return 'User updated successfully';
    } catch (error) {
      if (error.name === EntityNotFoundError.name) {
        throw new CustomException(
          'Failed to update the user record: User not found in the system.',
          1004,
          {},
          HttpStatus.NOT_FOUND,
        );
      }
      throw new CustomException(
        'Failed to update the user record: System encountered an unexpected issue.',
        1005,
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };

  delete = async (id: number): Promise<string> => {
    try {
      await this.findById(id);
      await this.userRepository.delete({ id });
      return 'User deleted successfully';
    } catch (error) {
      if (error.name === EntityNotFoundError.name) {
        throw new CustomException(
          'Failed to delete the user record: User not found in the system.',
          1004,
          error,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new CustomException(
        'Failed to delete the user record: System encountered an unexpected issue.',
        1005,
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };

  createBulk = async (userRecords: UserInputDTO[]): Promise<string> => {
    try {
      await this.userRepository.save(userRecords);
      return 'Users created successfully';
    } catch (error) {
      Logger.error(error.message, "Failed to create bulk users");
      if (error.message.includes('duplicate key value violates unique constraint')) {
        throw new DuplicateEntryException(
          'Duplicate entry error',
          1009,
          error.stack,
        );
      }
      throw new CustomException(
        'Bulk user creation failed',
        1008,
        error,
        HttpStatus.BAD_REQUEST,
      );
    }
  };

  handleUploadProcess = async (
    files: Array<Express.Multer.File>,
  ): Promise<{ fileName: string; filePath: string }> => {
    try {
      const { fileName, filePath } = await this.uploadFiles(files);
      const payload = {
        filePath: filePath,
        fileName: fileName,
        action: 'upload',
        files: files.map(file => ({
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        })),
      };
      await this.kafka.produce({
        topic: 'user-upload',
        messages: [{ value: JSON.stringify(payload) }],
      });
      return { filePath, fileName };
    } catch (error) {
      throw new CustomException(
        'Failed to write user upload content to file',
        1006,
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };

  uploadFiles = async (
    files: Array<Express.Multer.File>,
  ): Promise<{ fileName: string; filePath: string }> => {
    const zipFileName = `${Date.now()}-uploads.zip`;
    const uploadsDir = join(__dirname, '../', 'uploads');
    const zipFilePath = join(uploadsDir, zipFileName);

    // Create directory if not exists
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir);
    }

    return await new Promise((resolve, reject) => {
      const output = createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      output.on('close', () => resolve({ fileName: zipFileName, filePath: zipFilePath }));
      archive.on('error', (error) => {
        Logger.error('Failed to zip upload content', error);
        reject(new Error('Failed to zip user upload content'));
      });

      archive.pipe(output);

      files.forEach((file) => {
        const filePath = join(uploadsDir, file.originalname.replace(/\s+/g, '-'));
        writeFileSync(filePath, file.buffer);
        archive.file(filePath, { name: file.originalname });
      });

      archive.finalize();
    });
  };

  getFile = (fileName: string): string => {
    const filePath = join(__dirname, '../', 'uploads', fileName);
    if (!existsSync(filePath)) {
      throw new CustomException(
        'File not found',
        1007,
        {},
        HttpStatus.NOT_FOUND,
      );
    }
    return filePath;
  };

  exportUsers = async (age: string) => {
    const payload = {
      params: { age },
      action: 'export',
    };
    await this.kafka.produce({
      topic: 'user-export',
      messages: [{ value: JSON.stringify(payload) }],
    });
    return 'User export job created successfully';
  };
}
