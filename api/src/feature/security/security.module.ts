import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Credential, Token } from './data';
import { SecurityController } from './security.controller';
import { configManager } from '@common/config';
import { ConfigKey } from '@common/config/enum';
      global: true,
      secret: configManager.getValue(ConfigKey.JWT_TOKEN_SECRET),
      signOptions: { expiresIn: configManager.getValue(ConfigKey.JWT_TOKEN_EXPIRE_IN) },
  exports: [SecurityService],
  providers: [SecurityService, TokenService],
})
