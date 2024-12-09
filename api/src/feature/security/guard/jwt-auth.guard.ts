import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.error('Erreur JWT Guard:', { err, info });
      throw err || new UnauthorizedException('Non authentifié');
    }
    return user;
  }
}