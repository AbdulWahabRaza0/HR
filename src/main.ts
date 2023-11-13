import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;
  const config = new DocumentBuilder()
    .setTitle('HRMS')
    .setDescription('The is swagger documentation related to the NEST APIs')
    .setVersion('1.0')
    .addTag('HRMS')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port, () => {
    console.log('listening to port ', port);
  });
}
bootstrap();
