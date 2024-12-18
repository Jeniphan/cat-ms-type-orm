import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpClientService } from '@lib/http_client.service';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import * as process from 'node:process';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // TypeOrmModule.forRootAsync({
    //   useFactory: async () => ({
    //     type: 'mysql',
    //     host: process.env.DB_HOST,
    //     port: parseInt(process.env.DB_PORT),
    //     username: process.env.DB_USER,
    //     password: process.env.DB_PASSWORD,
    //     database: process.env.DB_NAME,
    //     entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //     synchronize: true,
    //   }),
    // }),
    CacheModule.registerAsync({
      useFactory: () => {
        const store = new KeyvRedis(
          `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        );
        return {
          store: store as unknown as CacheStore,
          ttl: parseInt(process.env.REDIS_TTL ?? '180000'), // 3 minutes (milliseconds)
        };
      },
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, HttpClientService],
})
export class AppModule {}
