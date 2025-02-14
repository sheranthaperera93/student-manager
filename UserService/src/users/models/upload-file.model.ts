import { Type } from 'class-transformer';

export class UploadFileDTO {
  @Type(() => Object)
  file: Express.Multer.File;
}
