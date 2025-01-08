// src/model/User/user.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

import { ClientController } from '../Client/client.controller';
import { UserController } from './user.controller';
import { AdministratorModule } from 'model/Administrator/administrator.module';
import { SecurityModule } from '@feature/security';
import { ClientService } from '../Client/client.service';
import { ClientModule } from 'model/Client/client.module';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AdministratorModule),
    SecurityModule,
    ClientModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule], // Assurez-vous d'exporter TypeOrmModule
})
export class UserModule {}
