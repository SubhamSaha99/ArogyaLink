import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import type {
  HealthCheckResponse,
  LivenessResponse,
  ServiceDependencyHealth,
} from './health.interface';

const TIMEOUT_MS = 3000;

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string,
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  getLiveness(): LivenessResponse {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }

  async check(): Promise<HealthCheckResponse> {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const isHealthy = database.status === 'up' && redis.status === 'up';
    const memoryUsage = process.memoryUsage();

    return {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      dependencies: {
        database,
        redis,
      },
      memory: {
        heapUsedMb:
          Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb:
          Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
      },
    };
  }

  private async checkDatabase(): Promise<ServiceDependencyHealth> {
    const start = Date.now();
    try {
      if (!this.dataSource.isInitialized) {
        return {
          status: 'down',
          responseTimeMs: Date.now() - start,
          error: 'DataSource is not initialized',
        };
      }

      await withTimeout(
        this.dataSource.query('SELECT 1'),
        TIMEOUT_MS,
        'Database query timed out',
      );

      return {
        status: 'up',
        responseTimeMs: Date.now() - start,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Database health check failed: ${err.message}`,
        err.stack,
      );

      return {
        status: 'down',
        responseTimeMs: Date.now() - start,
        error: err.message,
      };
    }
  }

  private async checkRedis(): Promise<ServiceDependencyHealth> {
    const start = Date.now();
    try {
      const client = this.redisService.getClient();

      const pong = await withTimeout(
        client.ping(),
        TIMEOUT_MS,
        'Redis ping timed out',
      );

      if (pong === 'PONG') {
        return {
          status: 'up',
          responseTimeMs: Date.now() - start,
        };
      }

      return {
        status: 'down',
        responseTimeMs: Date.now() - start,
        error: `Unexpected response from Redis: ${String(pong)}`,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Redis health check failed: ${err.message}`, err.stack);

      return {
        status: 'down',
        responseTimeMs: Date.now() - start,
        error: err.message,
      };
    }
  }
}
