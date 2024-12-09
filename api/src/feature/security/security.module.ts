// security.module.ts
import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';

// Services
import { SecurityService, TokenService } from './service';

// Entities
import { Credential, Token } from './data';
import { Client } from '../../model/Client/client.entity';

// Guards & Strategy
import { JwtGuard } from './guard';
import { JwtStrategy } from './guard/jwt.strategy';

// Configuration
import { configManager } from '@common/config';
import { ConfigKey } from '@common/config/enum';

// Controller
import { SecurityController } from './security.controller';
import { ClientModule } from '../../model/Client/client.module';
import { ClientService } from '../../model/Client/client.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule,  // Ajout du ConfigModule
    // TypeORM Configuration
    TypeOrmModule.forFeature([Credential, Token, Client]),

    // Passport Configuration
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT Configuration
    JwtModule.register({
      global: true,
      secret: configManager.getValue(ConfigKey.JWT_TOKEN_SECRET),
      signOptions: {
        expiresIn: configManager.getValue(ConfigKey.JWT_TOKEN_EXPIRE_IN)
      },
    }),

    // Client Module for ClientService
    ClientModule
  ],
  providers: [
    SecurityService,
    TokenService,
    JwtGuard,
    JwtStrategy, // Ajout de JwtStrategy
    Reflector,
    ClientService // Ajout de ClientService
  ],
  controllers: [SecurityController],
  exports: [
    SecurityService,
    JwtGuard,
    JwtModule,
    PassportModule,TokenService
  ],
})
export class SecurityModule {}