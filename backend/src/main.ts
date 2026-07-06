import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join, isAbsolute } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Habilita CORS para permitir requisições do frontend
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Documentacao Swagger / OpenAPI em /docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('YouTube Download API')
    .setDescription('API para download de videos do YouTube em MP3 ou MP4')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Serve os arquivos convertidos (ex.: http://localhost:3000/<id>.mp3)
  const dir = config.get<string>('DOWNLOADS_DIR', 'downloads');
  const downloadsDir = isAbsolute(dir) ? dir : join(process.cwd(), dir);
  app.useStaticAssets(downloadsDir);

  await app.listen(config.get<number>('PORT', 3000));
}
bootstrap();
