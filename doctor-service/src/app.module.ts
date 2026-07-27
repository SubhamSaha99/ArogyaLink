import { Module } from '@nestjs/common';
import { ProfileModule } from './docotor/doctor.module';
import { DatabaseModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ProfileModule, DatabaseModule],
})
export class AppModule {}
