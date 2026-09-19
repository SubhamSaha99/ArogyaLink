import { Module } from '@nestjs/common';
import { ProfileModule } from './docotor/doctor.module';
import { DatabaseModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { JwtStrategy } from './common/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProfileModule,
    DatabaseModule,
    RedisModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
