import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configManager } from '@common/config/config.manager';
import { JwtGuard, SecurityModule } from '@feature/security';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from '@feature/security/service';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRoot(configManager.getTypeOrmConfig())
    ,SecurityModule, ],
    controllers:[AppController],

  providers:[AppService,{
    provide: APP_GUARD, useClass: JwtGuard
  }],
})
export class AppModule {}
