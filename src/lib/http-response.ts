import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

export default class ApiResponse {
  constructor(private readonly reply: FastifyReply) {}

  private getErrorMessage = (exception: unknown): string => {
    return String(exception);
  };

  public error(err) {
    if (err instanceof HttpException) {
      throw err;
    } else {
      throw new InternalServerErrorException(err.message);
    }
  }

  public handle(
    result: any,
    status: number = HttpStatus.OK,
    message = 'success',
  ) {
    return this.reply.status(status).send({
      message,
      status,
      result,
    });
  }
}
