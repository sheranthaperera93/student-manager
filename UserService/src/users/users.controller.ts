import { Controller, Post, UploadedFile } from '@nestjs/common';
import { Response } from './models/response.model';
import { UsersService } from './users.service';
import { UploadFileDTO } from './models/upload-file.model';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('uploadUsers')
  uploadUsers(@UploadedFile() file: UploadFileDTO): Response {
    this.usersService.uploadFile(file.file);
    return { message: 'Upload OK', data: {} };
  }
}
