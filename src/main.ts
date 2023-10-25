import * as process from 'process';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

(async function () {
  const PORT: number = Number(process.env.PORT) || 5000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('ARM CLUB CONTROL')
    .setDescription('This app is build on NEST JS')
    .setVersion('0.0.1')
    .addTag('3aqaryan')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);
  await app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is started on ${PORT} port`);
  });
})();
