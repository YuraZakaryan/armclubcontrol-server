import * as process from 'process';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

(async function () {
  const PORT: number = Number(process.env.PORT) || 5000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // const AdminJS = await import('adminjs');
  // const AdminJSExpress = await import('@adminjs/express');
  // const AdminJSMongoose = await import('@adminjs/mongoose');
  //
  // const expressApp = app.get(HttpAdapterHost).httpAdapter;
  // const admin = new AdminJS.default({});
  // expressApp.use(
  //   admin.options.rootPath,
  //   AdminJSExpress.default.buildRouter(admin),
  //   AdminJS.default.registerAdapter({
  //     Resource: AdminJSMongoose.Resource,
  //     Database: AdminJSMongoose.Database,
  //   }),
  // );

  app.setGlobalPrefix('api');
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  const config = new DocumentBuilder()
    .setTitle('ARM CLUB CONTROL')
    .setDescription('This app is build on NEST JS')
    .setVersion('0.0.1')
    .addBearerAuth()
    .addTag('3aqaryan')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);
  await app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is started on ${PORT} port`);
  });
})();
