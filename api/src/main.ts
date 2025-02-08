import { NestFactory } from '@nestjs/core';
import {
  ApiInterceptor,
  HttpExceptionFilter,
  swaggerConfiguration,
} from '@common/config';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { configManager } from '@common/config';
import { ConfigKey } from '@common/config/enum';
import { AppModule } from './feature';
import { join } from 'path';
import * as express from 'express';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  // Ajout de CORS ici
  app.enableCors({
    origin: [
      'http://localhost:4200', // Autorise le frontend à accéder au backend
      'http://localhost:5000', // Autorise le Frontend Flutter Web à accéder au backend
      'http://10.0.2.2:2024', // Autorise Flutter mobile - émulateur android à accéder au backend
      'http://192.168.0.162:2024', // Autorise Flutter mobile sur appareil physique - Modif IP par IP local wifi
       ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Si vous utilisez des cookies ou de l'authentification
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');
  app.setGlobalPrefix(configManager.getValue(ConfigKey.APP_BASE_URL));
  app.enableCors({
    origin: 'http://localhost:4200', // URL de votre frontend Angular
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors = []) => {
        const messages = validationErrors
          .map((error) => error.toString())
          .join(', ');
        throw new BadRequestException(messages);
      },
    }),
  );

  // Ajouter une route statique pour pouvoir afficher (sevir) les fichiers pour les fichiers avatars !
  app.use('/api/assets/uploads', express.static(join(__dirname, '..', 'assets/uploads')));

  // Swagger configuration
  swaggerConfiguration.config(app);

  await app.listen(configManager.getValue(ConfigKey.APP_PORT));
  const logger: Logger = new Logger('Main Logger');
  logger.log('Server is started!');
};

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
