import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateUserInput } from './models/update-user.model';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { PaginatedUsers } from './models/paginated-users.model';
import { CustomException } from 'src/core/custom-exception';
import { JobQueue } from 'src/entities/job_queue.entity';
import { JOB_QUEUE_STATUS, JobData } from 'src/core/constants';
import { ProducerService } from 'src/kafka/producer/producer.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(JobQueue)
    private readonly jobQueueRepository: Repository<JobQueue>,
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

  handleUploadProcess = async (file: Express.Multer.File): Promise<{fileName: string, filePath: string}> => {
    const { fileName, filePath } = await this.uploadFile(file);
    console.log(fileName);
    // Insert Job details to job queue table with pending status
    await this.createUploadJob(filePath, fileName);

    // Create Job process file
    await this.sendUploadJob(filePath, fileName);

    // Send message to notification service to update UI layer with job status

    return {filePath, fileName};
  };

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

  createUploadJob = async (filePath: string, fileName: string) => {
    let jobQueue = new JobQueue();
    jobQueue.createdDate = new Date();
    jobQueue.status = JOB_QUEUE_STATUS.PENDING;
    let tmpJobData: JobData = {
      filePath,
      fileName,
    };
    jobQueue.jobData = JSON.stringify(tmpJobData);
    await this.jobQueueRepository.save(jobQueue);
  };

  sendUploadJob = async (filePath: string, fileName: string) => {
    const payload = {
      filePath: filePath,
      fileName: fileName,
      action: 'upload',
    };
    await this.kafka.produce({
      topic: 'user-upload',
      messages: [{ value: JSON.stringify(payload) }],
    });
  };

  getFile(fileName: string): string {
    console.log("fileName", fileName);
    const filePath = join(__dirname, '../', 'uploads', fileName);
    if (!existsSync(filePath)) {
      throw new CustomException(
        'File not found',
        1006,
        {},
        HttpStatus.NOT_FOUND,
      );
    }
    try {
      return filePath;
    } catch (error) {
      throw new CustomException(
        'Failed to read file',
        1007,
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
