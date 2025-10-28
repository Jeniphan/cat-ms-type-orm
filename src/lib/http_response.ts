import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ZodError } from 'zod';
import { AxiosError } from 'axios';
import { TypeORMError } from 'typeorm';

export default class ApiResponse {
  public error(err: unknown) {
    const logger = new Logger();
    logger.log(err);
    if (err instanceof HttpException) {
      return err;
    } else if (
      err instanceof ZodError ||
      err instanceof AxiosError ||
      err instanceof TypeORMError
    ) {
      return {
        message: err.message,
        status: HttpStatus.BAD_REQUEST,
        result: err.stack,
      };
    } else {
      return new InternalServerErrorException(err);
    }
  }
  public handle(
    result: any,
    status: number = HttpStatus.OK,
    message = 'success',
  ) {
    return {
      message,
      status,
      result,
    };
  }
}
