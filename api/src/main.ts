import { NestFactory } from '@nestjs/core';
import { ApiInterceptor, HttpExceptionFilter, ValidationException, swaggerConfiguration } from '@common/config';
import { configManager } from '@common/config/config.manager';
import { ConfigKey } from '@common/config/enum';

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  app.useGlobalInterceptors(new ApiInterceptor());
  app.setGlobalPrefix(configManager.getValue(ConfigKey.APP_BASE_URL));

  swaggerConfiguration.config(app);

  const logger: Logger = new Logger('Main Logger');
  logger.log('Server is started!');
});