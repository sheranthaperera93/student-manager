import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Response } from './models/response.model';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('uploadUsers')
  @UseInterceptors(FileInterceptor('file'))
  uploadUsers(@UploadedFile() file: Express.Multer.File): Response {
    this.usersService.uploadFile(file);
    return { message: 'Upload OK', data: {} };
  }
}
