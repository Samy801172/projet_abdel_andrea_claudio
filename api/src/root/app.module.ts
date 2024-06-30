import { User, configManager } from '@common/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptocurrencyModule } from 'model/Cryptocurrency/cryptocurrency.module';
import { ForumModule } from 'model/Forum/forum.module';
import { Subscription } from 'model/Subscription/subscription.entity';
import { SubscriptionModule } from 'model/Subscription/subscription.module';
import { TransactionModule } from 'model/Transaction/transaction.module';
import { UserModule } from 'model/User/user.module';
import { WalletModule } from 'model/Wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configManager.getTypeOrmConfig(),),
    TypeOrmModule.forFeature([User]),

    UserModule,
    WalletModule,
    SubscriptionModule,
    TransactionModule,
    CryptocurrencyModule,
    ForumModule




  ],
})
export class AppModule {}
