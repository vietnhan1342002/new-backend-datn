declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors(); // Bật CORS nếu cần thiết
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  app.setGlobalPrefix('/api/v1', { exclude: [''] });

  await app.listen(port);
}

bootstrap();
