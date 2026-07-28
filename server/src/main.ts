import 'dotenv/config';
import { join } from 'path';
import * as fs from 'fs';
import * as dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Use default system DNS if setServers fails
}

process.env.PUPPETEER_CACHE_DIR =
  process.env.PUPPETEER_CACHE_DIR || join(process.cwd(), '.cache', 'puppeteer');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { env } from './config/env';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.use(json({ limit: '25mb' }));
  app.use(urlencoded({ limit: '25mb', extended: true }));

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
  );
  app.useStaticAssets(join(process.cwd(), env.UPLOAD_DIR), { prefix: '/uploads' });
  const clientDist = join(process.cwd(), 'client', 'dist');
  if (fs.existsSync(clientDist)) {
    app.useStaticAssets(clientDist);
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Invoice Management System API')
    .setDescription('REST API for the Invoice & Billing module')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = process.env.PORT || env.PORT;
  await app.listen(port, '0.0.0.0');
  console.log(`Server listening on port ${port}`);
}
bootstrap();
