import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientService } from 'model/Client/client.service';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);

  constructor(
    private jwtService: JwtService,
    private clientService: ClientService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      this.logger.warn('No authorization header found in request');
      throw new UnauthorizedException('Token manquant');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      this.logger.warn('Invalid authorization header format');
      throw new UnauthorizedException('Format d\'autorisation invalide');
    }

    try {
      const payload = this.jwtService.verify(token);
      // Chercher le client associé au credential_id
      const client = await this.clientService.findByCredentialId(payload.sub);

      if (!client) {
        this.logger.error('Client not found for the given credential ID');
        throw new UnauthorizedException('Client non trouvé');
      }

      // Attacher le client à la requête
      request.user = {
        clientId: client.clientId,
        credentialId: payload.sub,
        isAdmin: payload.isAdmin,
      };

      return true;
    } catch (error) {
      this.logger.error('JWT validation error:', error);
      throw new UnauthorizedException('Token invalide');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
