// cart.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { Product } from '../Product/product.entity';
import { Client } from '../Client/client.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ClientModule } from '../Client/client.module'; // Importer le module Client

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, Product, Client]),
    ClientModule, // Ajouter ClientModule pour que ClientService soit disponible
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
