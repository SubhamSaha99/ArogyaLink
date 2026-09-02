import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../common/util/constant';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>('DEV_ENV') || 'local';
        const host =
          env === 'container'
            ? configService.getOrThrow<string>('REDIS_HOST')
            : '127.0.0.1';
        const port =
          env === 'container'
            ? Number(configService.getOrThrow<number>('REDIS_PORT'))
            : 6379;
        const redis = new Redis({
          host,
          port,
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: true,
          connectTimeout: 10000,
          retryStrategy(times) {
            return Math.min(times * 100, 2000);
          },
        });
        return redis;
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
