import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch(HttpException)
export class CustomException extends HttpException {
  constructor(message: string, code: number, stack: any, status: HttpStatus) {
    super({ message, code, stack }, status);
  }
}

@Catch(HttpException)
export class DuplicateEntryException extends HttpException {
  constructor(message: string, code: number, stack: any) {
    super({ message, code, stack }, HttpStatus.CONFLICT);
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = exception instanceof HttpException ? exception.getResponse() : {
      message: 'Internal server error',
      code: status,
      stack: exception instanceof Error ? exception.stack : null,
    };

    response.status(status).json(responseBody);
  }
}