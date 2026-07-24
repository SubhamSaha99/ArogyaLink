import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    // {
    //   transport: Transport.GRPC,
    //   options: {
    //     package: DOCTOR_PACKAGE_NAME,
    //     protoPath: join(__dirname, 'proto/doctor.proto'),
    //     url: process.env.AUTH_SERVICE_GRPC_URL ?? '0.0.0.0:50052',
    //   },
    // },
  );

  app.enableShutdownHooks();
  await app.listen();
}
void bootstrap();
