import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(message: string, code: number, stack: any, status: HttpStatus) {
    super({ message, code, stack }, status);
  }
}
