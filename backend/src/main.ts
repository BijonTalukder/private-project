import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // dev phase
    credentials: true,
  });
  // app.use(
  //   cors({
  //     origin:
  //       process.env.NODE_ENV === 'production'
  //         ? process.env.CORS_ORIGIN?.split(',')
  //         : [
  //           'http://localhost:5173',
  //           'http://192.168.66.51:3000',
  //           'http://localhost:3000',
  //           'http://192.168.66.212:3000',
  //           'http://192.168.66.19:3000',
  //         ],
  //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //     credentials: true,
  //   }),
  // );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
