import { Module } from '@nestjs/common';
import { ProfileModule } from './docotor/doctor.module';
import { DatabaseModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProfileModule,
    DatabaseModule,
    RedisModule,
    HealthModule
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
