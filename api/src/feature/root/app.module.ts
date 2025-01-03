import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configManager } from '@common/config';
import { Client } from '../../model/Client/client.entity';

// Modules de fonctionnalités
import { SecurityModule } from '@feature/security';

// Modules métier
import { AdministratorModule } from 'model/Administrator/administrator.module';
import { ClientModule } from 'model/Client/client.module';
import { UserModule } from 'model/User/user.module';
import { ProductModule } from 'model/Product/product.module';
import { TypeModule } from 'model/Type/type.module';
import { CartModule } from 'model/Cart/cart.module';
import { OrderModule } from 'model/Order/order.module';
import { OrderStatusModule } from 'model/OrderStatus/orderStatus.module';
import { ServiceModule } from 'model/Service/service.module';
import { AppointmentModule } from 'model/Appointment/appointment.module';
import { PromotionModule } from 'model/Promotion/promotion.module';
import { InvoiceModule } from 'model/Invoice/invoice.module';

// Entités (si nécessaire pour TypeORM.forFeature)
import { Service } from 'model/Service/service.entity';
import { Appointment } from 'model/Appointment/appointment.entity';
import { OrderDetailModule } from 'model/Order/OrderDetail/order-detail.module';
import { StockModule } from 'model/Stock/stock.module';
import { PaymentModule } from '../../model/Payment/payment.module';
import { PrescriptionModule } from '../../model/Prescription/prescription.module';

@Module({
  imports: [
    // Configuration TypeORM
    TypeOrmModule.forRoot(configManager.getTypeOrmConfig()),
    TypeOrmModule.forFeature([Service, Appointment, Client]),

    // Module de sécurité
    SecurityModule,
    ClientModule,

    // Modules utilisateurs
    UserModule,
    ClientModule,
    AdministratorModule,

    // Modules produits et catalogue
    ProductModule,
    TypeModule,
    CartModule,
    PromotionModule,
    StockModule,
    PaymentModule,
    PrescriptionModule,



    // Modules commandes et facturation
    OrderModule,
    OrderStatusModule,
    OrderDetailModule,
    InvoiceModule,

    // Modules services et rendez-vous
    ServiceModule,
    AppointmentModule,
  ],

})
export class AppModule {}
