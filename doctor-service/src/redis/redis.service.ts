import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_CLIENT } from '../util/constants';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  onModuleInit() {
    this.redis.on('connect', () => {
      this.logger.log('Redis connecting');
    });

    if (this.redis.status !== 'ready' && this.redis.status !== 'connecting') {
      void this.redis.connect();
    }

    this.redis.on('ready', () => {
      this.logger.log('Redis ready');
    });

    this.redis.on('error', (error: Error) => {
      this.logger.error(error.message, error.stack);
    });

    this.redis.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    this.redis.on('reconnecting', (delay: number) => {
      this.logger.warn(`Redis reconnecting, delay=${delay}ms`);
    });

    this.redis.on('end', () => {
      this.logger.warn('Redis connection ended');
    });
  }

  getClient(): Redis {
    return this.redis;
  }

  pipeline() {
    return this.redis.pipeline();
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl !== undefined) {
      await this.redis.set(key, value, 'EX', ttl);
      return;
    }

    await this.redis.set(key, value);
  }

  async increment(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async decrement(key: string): Promise<number> {
    return this.redis.decr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redis.exists(key)) === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  async setWithTTL(key: string, value: string, ttl: number): Promise<void> {
    await this.redis.set(key, value, 'EX', ttl);
  }

  async onModuleDestroy() {
    try {
      await this.redis.quit();
      this.logger.log('Redis connection closed gracefully');
    } catch (error) {
      this.logger.error('Error closing Redis', error as Error);

      this.redis.disconnect();
    }
  }
}
