
import { CanActivate, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenService } from './token.service';
import { Credential, RefreshTokenPayload, SignInPayload, SignupPayload, Token } from "@feature/security/data";
import {CredentialDeleteException, SignupException, UserAlreadyExistException, UserNotFoundException } from "@feature/security/security.exception";
import { comparePassword, encryptPassword } from "@feature/security/utils";
import { Builder } from 'builder-pattern';
import { isNil } from 'lodash';
import { JwtGuard } from '../guard';
import { catchError } from 'rxjs';
import {ulid} from 'ulid';


@Injectable()
export class SecurityService {

 private readonly logger = new Logger(SecurityService.name);
  constructor(
      @InjectRepository(Credential) private readonly repository: Repository<Credential>,
      private readonly tokenService: TokenService
  ){}

  // Part detail
  async detail(id: string): Promise<Credential> {
    const result: Credential = await this.repository.findOne({ where: { credential_id: id } });

    if (!isNil(result)) {
      return result;
    }
    throw new UserNotFoundException();
  }

//Part signIn

  async signIn(payload: SignInPayload,isAdmin:boolean): Promise<Token | null> {
    let result = null;
    if (payload.socialLogin) {
      if (!isNil(payload.facebookHash) && payload.facebookHash.length > 0) {
        result = await this.repository.findOneBy({facebookHash: payload.facebookHash,
          isAdmin:isAdmin});
      } else if (!isNil(payload.googleHash) && payload.googleHash.length > 0) {
        result = await this.repository.findOneBy({googleHash: payload.googleHash,
          isAdmin:isAdmin});
      }
    } else {
      result = await this.repository.findOneBy({username: payload.username,
        isAdmin:isAdmin});
    }
    if (!isNil(result) && (payload.socialLogin || await comparePassword(payload.password, result.password))) {
      return this.tokenService.getTokens(result);// If it’s okay, the tokens are generated
    }

    throw new UserNotFoundException();
  }
  //part signUp
  async signup(payload: SignupPayload): Promise<Credential | null> {
    const result: Credential | null = await this.repository.findOneBy({username:
      payload.username});
    if (!isNil(result)) {
      throw new UserAlreadyExistException();
    }
    try {
      const encryptedPassword = (payload.facebookHash?.length === 0 &&
          payload.googleHash?.length === 0) ? await encryptPassword(payload.password) : '';
      return this.repository.save(Builder<Credential>()
          .credential_id(ulid())
          .username(payload.username)
          .password(encryptedPassword)
          .facebookHash(payload.facebookHash)
          .googleHash(payload.googleHash)
          .mail(payload.mail)
          .build());
    } catch (e) {
      this.logger.error(e);
      throw new SignupException();
    }
  }

  //part refresh
  async refresh(payload: RefreshTokenPayload): Promise<Token | null> {
    return this.tokenService.refresh(payload);
  }

  //part Delete

  async delete(id:string): Promise<void> {
    try {
      const detail = await this.detail(id);
      await this.tokenService.deleteFor(detail);
      await this.repository.remove(detail);
    } catch (e) {
      throw new CredentialDeleteException();
    }
  }

}