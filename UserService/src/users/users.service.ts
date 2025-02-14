import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateUserInput } from './models/update-user.model';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { User, User as UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { PaginatedUsers } from './models/paginated-users.model';
import { CustomException } from 'src/core/custom-exception';
import { JobQueue } from 'src/entities/job_queue.entity';
import { JOB_QUEUE_STATUS, JobData } from 'src/core/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jobQueueRepository: Repository<JobQueue>,
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
    // Insert Job details to job queue table with pending status
    let jobQueue = new JobQueue();
    jobQueue.createdDate = new Date();
    jobQueue.status = JOB_QUEUE_STATUS.PENDING;
    let tmpJobData: JobData = {
      filePath,
    };
    jobQueue.jobData = JSON.stringify(tmpJobData);
    this.jobQueueRepository.save(jobQueue);
    // Create Job process file
    // Send message to notification service to update UI layer with job status
    return true;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    if (!existsSync(join(__dirname, '../', 'uploads'))) {
      mkdirSync(join(__dirname, '../', 'uploads'));
    }
    const filePath = join(__dirname, '../', 'uploads', fileName);

    return await new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      writeStream.write(file.buffer);
      writeStream.end();
      writeStream.on('finish', () => resolve(filePath));
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
}
