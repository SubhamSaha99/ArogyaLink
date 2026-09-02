import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { AUTH_PACKAGE_NAME } from './proto/generated/auth';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: AUTH_PACKAGE_NAME,
        protoPath: join(__dirname, 'proto/auth.proto'),
        url: process.env.AUTH_SERVICE_GRPC_URL ?? '0.0.0.0:50051',
      },
    },
  );

  app.enableShutdownHooks();
  await app.listen();
}
void bootstrap();
