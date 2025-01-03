// paypal.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaypalService } from './paypal.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [PaypalService],
  exports: [PaypalService],
})
export class PaypalModule {}