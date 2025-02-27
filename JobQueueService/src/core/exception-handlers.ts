import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch(HttpException)
export class CustomException extends HttpException {
  constructor(message: string, code: number, stack: any, status: HttpStatus) {
    super({ message, code, stack }, status);
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    response.status(status).json({
      message: 'Internal server error',
      code: status,
      stack: exception instanceof Error ? exception.stack : null,
    });
  }
}