import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/db.module';
import { HealthInstituteModule } from './health-institute/health-institute.module';
import { RedisModule } from './redis/redis.module';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { DatabaseService } from './db/db.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, HealthInstituteModule, RedisModule],
  providers: [JwtStrategy, DatabaseService],
})
export class AppModule {}
