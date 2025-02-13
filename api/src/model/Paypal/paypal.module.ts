import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [PaypalService],
  exports: [PaypalService]
})
export class PaypalModule {}