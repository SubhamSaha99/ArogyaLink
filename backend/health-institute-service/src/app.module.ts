import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/db.module';
import { HealthInstituteModule } from './health-institute/health-institute.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, HealthInstituteModule, RedisModule],
})
export class AppModule {}
