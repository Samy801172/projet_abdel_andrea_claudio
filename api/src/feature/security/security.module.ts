import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { Credential, Token } from './data';
import { SecurityController } from './security.controller';
import { SecurityService, TokenService } from './service';

import { configManager } from '@common/config';
import { ConfigKey } from '@common/config/enum';
import { JwtGuard } from './guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([Credential, Token]),
    JwtModule.register({
      global: true,
      secret: configManager.getValue(ConfigKey.JWT_TOKEN_SECRET),
      signOptions: { expiresIn: configManager.getValue(ConfigKey.JWT_TOKEN_EXPIRE_IN) },
    }),
  ],
  exports: [SecurityService],
  providers: [SecurityService, TokenService,JwtGuard, JwtService,Reflector],
  controllers: [SecurityController],

})
export class SecurityModule {}
