import { Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class HttpClientService {
  private endpoint =
    process.env.ENDPOINT_APPLICATION_MS || 'http://localhost:3000';

  private mergeConfig(config: AxiosRequestConfig): AxiosRequestConfig {
    return {
      baseURL: this.endpoint,
      ...config,
    };
  }

  //CallApi Method
  public async CallApi<T = any>(
    config: AxiosRequestConfig,
  ): Promise<MessageResultAPI<T>> {
    const apiConfig: AxiosRequestConfig = this.mergeConfig(config);
    return await axios
      .request(apiConfig)
      .then((res: AxiosResponse<MessageResultAPI<T>>) => {
        return new MessageResultAPI<T | any>(
          res.status,
          res.data.message,
          res.data.result,
        );
      })
      .catch((err: AxiosError<MessageResultAPI<T>>) => {
        return new MessageResultAPI<T>(
          err.status ?? 500,
          err.response?.data.message ?? '',
          err.response?.data.result,
        );
      });
  }
}

export class MessageResultAPI<T = any> {
  result: T | null;
  message: string;
  status: number;

  constructor(_status = 500, _message = '', _result: T | null = null) {
    this.result = _result;
    this.message = _message;
    this.status = _status;
  }
}
