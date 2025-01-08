// src/modules/type.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeService } from './type.service';
import { TypeController } from './type.controller';
import { Type } from './type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Type])],
  providers: [TypeService],
  controllers: [TypeController],
  exports: [TypeOrmModule.forFeature([Type])], // Export the TypeRepository
})
export class TypeModule {}
