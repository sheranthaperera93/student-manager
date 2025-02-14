import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from './models/user.model';
import { UpdateUserInput } from './models/update-user.model';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { PaginatedUsers } from './models/paginated-users.model';
import { CustomException } from 'src/core/custom-exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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

  findById(id: number): Promise<User> {
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

  async handleUploadProcess(file: Express.Multer.File) {
    const filePath = await this.uploadFile(file);
    console.log(filePath);
    // Create Job process file
    // Insert Job details to job queue table with pending status
    // Send message to notification service to update UI layer with job status
    return true;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const { stream } = file;
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = join(__dirname, '..', '..', 'uploads', fileName);

    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      stream
        .pipe(writeStream)
        .on('finish', () => resolve(filePath))
        .on('error', (error) =>
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
}
