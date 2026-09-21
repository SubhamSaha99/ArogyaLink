import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { HEALTH_INSTITUTE_PACKAGE_NAME } from './proto/generated/health-institute';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: HEALTH_INSTITUTE_PACKAGE_NAME,
      protoPath: join(__dirname, 'proto/health-institute.proto'),
      url: process.env.HEALTH_INSTITUTE_SERVICE_GRPC_URL ?? '0.0.0.0:50052',
      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: false,
        oneofs: false,
        arrays: true,
      },
    },
  });

  await app.startAllMicroservices();

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 3001);
  app.enableShutdownHooks();
}
void bootstrap();
