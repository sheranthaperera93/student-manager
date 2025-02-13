import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';
import { UpdateUserInput } from './models/update-user.model';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { FileUpload } from 'graphql-upload-minimal';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { PaginatedUsers } from './models/paginated-users.model';

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
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    Object.assign(user, updateUserInput);
    await this.userRepository.update({ id: user.id }, user);
    return "User updated successfully";
  }

  async delete(id: number): Promise<string> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    await this.userRepository.delete({ id });
    return 'User deleted successfully';
  }

  async handleUploadProcess(file: FileUpload) {
    const filePath = await this.uploadFile(file);
    console.log(filePath);
    // Create Job process file
    // Insert Job details to job queue table with pending status
    // Send message to notification service to update UI layer with job status
    return true;
  }

  /**
   * Uploads a file to the server.
   *
   * @param {FileUpload} file - The file to be uploaded, containing a createReadStream function and filename.
   * @returns {Promise<string>} - A promise that resolves to the path where the file was saved.
   *
   * @throws {Error} - Throws an error if the file upload fails.
   */
  async uploadFile(file: FileUpload): Promise<string> {
    const { createReadStream, filename } = file;
    const path = join(__dirname, '..', 'uploads', `${Date.now()}-${filename}`);
    return new Promise((resolve, reject) => {
      createReadStream()
        .pipe(createWriteStream(path))
        .on('finish', () => resolve(path))
        .on('error', () => reject(new Error('Error uploading file')));
    });
  }
}
