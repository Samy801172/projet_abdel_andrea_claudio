import { NestFactory } from '@nestjs/core';
import { ApiInterceptor, HttpExceptionFilter, swaggerConfiguration } from '@common/config';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { configManager } from '@common/config';
import { ConfigKey } from '@common/config/enum';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuration CORS
  app.enableCors({
    origin: ['http://localhost:50691', 'http://127.0.0.1:50691'], // Ajoutez les origines de votre app Flutter
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true
  });

  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, Origin');
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.status(204).end();
    } else {
      next();
    }
  });

  // Configuration globale
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');
  app.setGlobalPrefix(configManager.getValue(ConfigKey.APP_BASE_URL));
  
  // Validation des données
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors = []) => {
        const messages = validationErrors.map(error => error.toString()).join(', ');
        throw new BadRequestException(messages);
      }
    })
  );

  // Configuration Swagger
  swaggerConfiguration.config(app);

  // Démarrage du serveur sur toutes les interfaces
  const port = 2024; // Port fixe pour le développement
  await app.listen(port, '0.0.0.0');
  
  const logger = new Logger('Main');
  logger.log(`Server running on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Bootstrap error:', error);
  process.exit(1);
});