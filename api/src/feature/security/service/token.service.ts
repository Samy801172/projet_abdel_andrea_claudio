import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Credential, RefreshTokenPayload, Token } from '../data';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'model/Client/client.entity';
import { configManager } from '@common/config/config.manager';
import { ConfigKey } from '@common/config/enum';
import {
  TokenExpiredException,
  TokenGenerationException,
} from '../security.exception';
import { ulid } from 'ulid';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    @InjectRepository(Token)
    private readonly repository: Repository<Token>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly jwtService: JwtService,
  ) {}

  async getTokens(credential: Credential): Promise<Token> {
    try {
      // 1. Supprimer les anciens tokens
      await this.deleteFor(credential);

      // 2. Trouver le client associé
      const client = await this.clientRepository.findOne({
        where: { credentialId: credential.credential_id },
      });

      // 3. Créer le payload avec le clientId
      const payload = {
        sub: credential.credential_id,
        email: credential.mail,
        isAdmin: credential.isAdmin,
        clientId: client?.clientId,
      };

      // 4. Générer les tokens
      const [token, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: configManager.getValue(ConfigKey.JWT_TOKEN_SECRET),
          expiresIn: configManager.getValue(ConfigKey.JWT_TOKEN_EXPIRE_IN),
        }),
        this.jwtService.signAsync(payload, {
          secret: configManager.getValue(ConfigKey.JWT_REFRESH_TOKEN_SECRET),
          expiresIn: configManager.getValue(
            ConfigKey.JWT_REFRESH_TOKEN_EXPIRE_IN,
          ),
        }),
      ]);

      // 5. Créer et sauvegarder le nouveau token
      const newToken = this.repository.create({
        token_id: ulid(),
        token,
        refreshToken,
        credential,
        credentialId: credential.credential_id,
        clientId: client?.clientId,
      });

      return await this.repository.save(newToken);
    } catch (error) {
      this.logger.error('Token generation error:', error);
      throw new TokenGenerationException();
    }
  }
  async deleteFor(credential: Credential): Promise<void> {
    try {
      // Supprimer tous les tokens existants pour cet utilisateur
      await this.repository.delete({
        credential: { credential_id: credential.credential_id },
      });
    } catch (error) {
      this.logger.error('Error deleting tokens:', error);
      // Continue même si la suppression échoue
    }
  }
  //part refresh

  async refresh(payload: RefreshTokenPayload): Promise<Token> {
    try {
      const decoded = this.jwtService.verify(payload.refresh, {
        secret: configManager.getValue(ConfigKey.JWT_REFRESH_TOKEN_SECRET),
      });

      const credential = await this.credentialRepository.findOneBy({
        credential_id: decoded.sub,
      });

      if (!credential) {
        throw new UnauthorizedException('Credential not found');
      }

      return this.getTokens(credential);
    } catch (error) {
      this.logger.error('Refresh token error:', error);
      throw new TokenExpiredException();
    }
  }
}
