import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from './models/response.model';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response as ExpressResponse } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUsers(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Response> {
    const uploadDetails = await this.usersService.handleUploadProcess(file);
    return { message: 'File upload job initiated successfully', data: uploadDetails };
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
