// src/model/Administrator/administrator.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministratorService } from './administrator.service';
import { UserModule } from '../User/user.module'; // Importez le UserModule
import { AdministratorController } from './administrator.controller';
import { Administrator } from './administrator.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Administrator]),
    UserModule,
    forwardRef(() => UserModule), // Utilisez forwardRef ici
  ],
  controllers: [AdministratorController],
  providers: [AdministratorService],
  exports: [AdministratorService, TypeOrmModule.forFeature([Administrator])], // Exportez le repository si nécessaire
})
export class AdministratorModule {}
