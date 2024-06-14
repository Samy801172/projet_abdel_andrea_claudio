import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configManager } from '@common/config/config.manager';
import { JwtGuard, SecurityModule } from '@feature/security';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from 'model/User/user.module';
import { WalletModule } from 'model/Wallet/wallet.module';
import { SubscriptionModule } from 'model/Subscription/subscription.module';
import { CryptocurrencyModule } from '../../model/Cryptocurrency/cryptocurrency.module';
import { ForumModule } from '../../model/Forum/forum.module';
import { TransactionModule } from '../../model/Transaction/transaction.module';


@Module({
  imports: [
    TypeOrmModule.forRoot(configManager.getTypeOrmConfig()),
    SecurityModule,
    UserModule,
    WalletModule,




  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}

