import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-minimal';

@InputType()
export class UploadFileInput {
  @Field(() => GraphQLUpload)
  file: Promise<FileUpload>;
}