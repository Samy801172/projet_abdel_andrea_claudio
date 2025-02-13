import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ManufacturingController } from './manufacturing.controller';
import { ManufacturingService } from './manufacturing.service';
import { ManufacturingStatus } from './manufacturing-status.entity';
import { Order } from '../Order/order.entity';
import { ManufacturingCustomRequest } from './manufacturing-custom-request.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigKey } from '@common/config/enum/config-key.enum';
import { configManager } from '@common/config';
import { OrderModule } from '../Order/order.module';
import { ClientModule } from '../Client/client.module';
import { Manufacturing } from './manufacturing.entity';
import { StockModule } from '../Stock/stock.module';
import { NotificationModule } from '../Notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ManufacturingStatus, 
      Order,
      ManufacturingCustomRequest,
      Manufacturing
    ]),
    OrderModule,
    JwtModule.register({
      secret: configManager.getValue(ConfigKey.JWT_SECRET),
      signOptions: { expiresIn: '1d' },
    }),
    ClientModule,
    MulterModule.register({
      dest: './uploads/prescriptions',
    }),
    StockModule,
    NotificationModule
  ],
  controllers: [ManufacturingController],
  providers: [ManufacturingService],
  exports: [ManufacturingService]
})
export class ManufacturingModule {} 