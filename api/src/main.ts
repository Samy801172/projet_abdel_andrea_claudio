import { NestFactory } from '@nestjs/core';
import { ApiInterceptor, HttpExceptionFilter, swaggerConfiguration } from '@common/config';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { WalletService } from './model/Wallet/wallet.service';
import { configManager } from '@common/config';
import { ConfigKey } from '@common/config/enum';
import { AppModule } from './feature';



const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();


  const walletService = app.get(WalletService);


  app.useGlobalInterceptors(new ApiInterceptor(walletService));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix(configManager.getValue(ConfigKey.APP_BASE_URL));
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors = []) => {
        const messages = validationErrors.map(error => error.toString()).join(', ');
        throw new BadRequestException(messages);
      }
    })
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
