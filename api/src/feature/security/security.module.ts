
import {TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Credential,Token } from './data';
import { SecurityService, TokenService } from '@feature/security/service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SecurityController } from './security.controller';
import { configManager } from '@common/config';
import { ConfigKey } from '@common/config/enum';
@Module(
  { imports: [JwtModule.register({
      global: true,
      secret: configManager.getValue(ConfigKey.JWT_TOKEN_SECRET),
      signOptions: {expiresIn: configManager.getValue(ConfigKey.JWT_TOKEN_EXPIRE_IN)},
    }), TypeOrmModule.forFeature([Credential, Token])],
    exports: [SecurityService],
    providers: [SecurityService, TokenService],
    controllers: [SecurityController]
  })
export class SecurityModule {
}


