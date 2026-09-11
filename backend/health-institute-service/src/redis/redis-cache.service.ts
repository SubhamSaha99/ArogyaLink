import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RedisService } from './redis.service';

interface CacheOptions {
  ttl: number;
  lockTtl?: number;
  retries?: number;
  retryDelay?: number;
  jitter?: number;
}

@Injectable()
export class RedisCacheService {
  constructor(private readonly redisService: RedisService) {}

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions,
  ): Promise<T> {
    const {
      ttl,
      lockTtl = 10,
      retries = 5,
      retryDelay = 50,
      jitter = 30,
    } = options;

    // TODO: Check cache
    const cached = await this.redisService.get(key);

    if (cached) {
      return JSON.parse(cached) as T;
    }

    const lockKey = `lock:${key}`;
    const lockToken = randomUUID();

    // TODO: Try to acquire lock
    const lockAcquired = await this.redisService.acquireLock(
      lockKey,
      lockToken,
      lockTtl,
    );

    if (lockAcquired) {
      try {
        // TODO: Double-check cache
        const cachedAfterLock = await this.redisService.get(key);

        if (cachedAfterLock) {
          return JSON.parse(cachedAfterLock) as T;
        }

        // TODO: Fetch from DB/API
        const data = await fetcher();

        // TODO: TTL jitter
        const finalTtl = ttl + Math.floor(Math.random() * jitter);

        // TODO: Store in cache
        await this.redisService.set(key, JSON.stringify(data), finalTtl);

        return data;
      } finally {
        // TODO: Release lock
        await this.redisService.releaseLock(lockKey, lockToken);
      }
    }

    // TODO: Another request is fetching the data
    for (let attempt = 0; attempt < retries; attempt++) {
      await this.sleep(retryDelay);

      const cachedAfterWait = await this.redisService.get(key);

      if (cachedAfterWait) {
        return JSON.parse(cachedAfterWait) as T;
      }
    }

    return fetcher();
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
