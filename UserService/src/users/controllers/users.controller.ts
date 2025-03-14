import {
  Controller,
  Post,
  UseInterceptors,
  Get,
  Param,
  Res,
  UploadedFiles,
} from '@nestjs/common';
import { Response } from '../models/response.model';
import { UsersService } from './../services/users.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response as ExpressResponse } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadUsers(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Response> {
    const uploadDetails = await this.usersService.handleUploadProcess(files);
    return {
      message: 'File upload job initiated successfully',
      data: uploadDetails,
    };
  }

  @Get('upload/:fileName')
  getFile(
    @Param('fileName') fileName: string,
    @Res() res: ExpressResponse,
  ): void {
    const file: string = this.usersService.getFile(fileName);
    res.sendFile(file);
  }
}
