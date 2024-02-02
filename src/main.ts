import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import * as swaggerUiAssetPath from 'swagger-ui-dist';
import * as express from 'express';
import * as path from 'path';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  const port = process.env.PORT || 3001;
  const config = new DocumentBuilder()
    .setTitle('HRMS')
    .setDescription('These are the APIs belongs to HRMS Backend')
    .setVersion('1.0')
    .addTag('hrms')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();
  //for json data use api-json
  // const swaggerDistPath = swaggerUiAssetPath.getAbsoluteFSPath();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(
    '/api-doc',
    express.static(path.join(__dirname, './swagger-ui-dist')),
  );
  await app.listen(port, () => {
    console.log('listening to port ', port);
  });
}
bootstrap();
