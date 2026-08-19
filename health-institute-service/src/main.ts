import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { HEALTH_INSTITUTE_PACKAGE_NAME } from './proto/generated/health-institute';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: HEALTH_INSTITUTE_PACKAGE_NAME,
        protoPath: join(__dirname, 'proto/health-institute.proto'),
        url: process.env.HEALTH_INSTITUTE_SERVICE_GRPC_URL ?? '0.0.0.0:50053',
      },
    },
  );

  app.enableShutdownHooks();
  await app.listen();
}
void bootstrap();
