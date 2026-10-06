import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './db/db.module';
import { DatabaseService } from './db/db.service';
import { RedisModule } from './redis/redis.module';
import { RateLimiterModule } from './common/rate-limiter/rate-limiter.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    DatabaseModule,
    RedisModule,
    RateLimiterModule,
    HealthModule,
  ],
  providers: [DatabaseService],
})
export class AppModule {}
