import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { RateLimitOptions } from '../interfaces/rate-limiter.interface';
import { throwRpcException } from '../util/rpc-exception';
import { status } from '@grpc/grpc-js';

@Injectable()
export class RateLimiterService {
  constructor(private readonly redisService: RedisService) {}

  async throwIfBlocked(options: RateLimitOptions): Promise<void> {
    const attempts = Number((await this.redisService.get(options.key)) ?? 0);

    if (attempts < options.maxAttempts) {
      return;
    }

    const ttl = await this.redisService.ttl(options.key);

    throwRpcException(
      status.RESOURCE_EXHAUSTED,
      `Too many requests. Try again after ${this.formatTime(ttl)}.`,
    );
  }

  async recordFailure(options: RateLimitOptions): Promise<number> {
    const attempts = await this.redisService.increment(options.key);

    if (attempts === 1) {
      await this.redisService.expire(options.key, options.blockDuration);
    }

    return attempts;
  }

  async clear(key: string): Promise<void> {
    await this.redisService.delete(key);
  }

  async getRemainingAttempts(options: RateLimitOptions): Promise<number> {
    const attempts = Number((await this.redisService.get(options.key)) ?? 0);

    return Math.max(options.maxAttempts - attempts, 0);
  }

  async getRemainingTime(key: string): Promise<number> {
    return this.redisService.ttl(key);
  }

  private formatTime(seconds: number): string {
    if (seconds <= 0) {
      return 'a few moments';
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes} minute(s) ${remainingSeconds} second(s)`;
    }

    return `${remainingSeconds} second(s)`;
  }
}
