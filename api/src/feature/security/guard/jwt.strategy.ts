import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ClientService } from 'model/Client/client.service';

interface JwtPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private clientService: ClientService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_TOKEN_SECRET
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    try {
      this.logger.debug('JWT Payload:', payload);

      // Pour les admins, on peut retourner directement les infos sans chercher le client
      if (payload.isAdmin) {
        this.logger.debug('Utilisateur admin détecté');
        return {
          credentialId: payload.sub,
          email: payload.email,
          isAdmin: true
        };
      }

      // Pour les clients normaux, on vérifie l'existence dans la base
      const client = await this.clientService.findByCredentialId(payload.sub);
      this.logger.debug('Client trouvé:', client);

      if (!client && !payload.isAdmin) {
        this.logger.error(`Client non trouvé pour credential ${payload.sub}`);
        throw new UnauthorizedException('Client non trouvé');
      }

      return {
        credentialId: payload.sub,
        clientId: client?.clientId,
        email: payload.email,
        isAdmin: payload.isAdmin
      };
    } catch (error) {
      this.logger.error('Erreur validation JWT:', error);
      throw new UnauthorizedException('Token invalide');
    }
  }
}