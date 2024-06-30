import { JwtService } from '@nestjs/jwt';
import { from, Observable } from 'rxjs';
import { NoTokenFoundedException, TokenExpiredException } from '../security.exception';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@common/config';
import { isNil } from 'lodash';
import { map } from 'rxjs/operators';
import { Credential } from '@feature/security/data';

import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { SecurityService } from '../service';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly logger = new Logger(JwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly securityService: SecurityService,
    private reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    return isPublic ? true : this.validateToken(context.switchToHttp().getRequest());
  }

  private validateToken(request: any): Observable<boolean> {
    const authHeader = request.headers['authorization'];
    if (!isNil(authHeader)) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decodedToken = this.jwtService.verify(token);
        const id = decodedToken.sub;
        this.logger.log(`Token valid for user ID: ${id}`);
        return from(this.securityService.detail(id)).pipe(
          map((user: Credential) => {
            request.user = user;
            return true;
          })
        );
      } catch (e) {
        this.logger.error(`Token validation error: ${e.message}`);
        throw new TokenExpiredException();
      }
    }
    this.logger.warn('No token found in request headers');
    throw new NoTokenFoundedException();
  }
}
