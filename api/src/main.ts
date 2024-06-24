import { NestFactory } from '@nestjs/core';
import { ApiInterceptor, HttpExceptionFilter, ValidationException, swaggerConfiguration } from '@common/config';
import { AppModule } from '@feature/root';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { configManager } from '@common/config/config.manager';
import { ConfigKey } from '@common/config/enum';
import { Logger } from '@nestjs/common';
import { WalletService } from 'model/Wallet/wallet.service';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  const walletService = app.get(WalletService); // <--- Get the WalletService instance
  app.useGlobalInterceptors(new ApiInterceptor(walletService)); // <--- Pass the WalletService instance to the ApiInterceptor

  app.setGlobalPrefix(configManager.getValue(ConfigKey.APP_BASE_URL));
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const messages = validationErrors.map(error => error['message']).join(', ');
        throw new BadRequestException(messages);
      }
    }),
  );

  swaggerConfiguration.config(app);

  await app.listen(configManager.getValue(ConfigKey.APP_PORT));
  const logger: Logger = new Logger('Main Logger');
  logger.log('Server is started!');
};

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
