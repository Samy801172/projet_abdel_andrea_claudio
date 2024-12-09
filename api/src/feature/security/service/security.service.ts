import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { TokenService } from './token.service';
import { Credential, RefreshTokenPayload, SignInPayload, SignupPayload, Token } from "@feature/security/data";
import { CredentialDeleteException, SignupException, UserAlreadyExistException, UserNotFoundException } from "@feature/security/security.exception";
import { Builder } from 'builder-pattern';
import { isNil } from 'lodash';
import { ulid } from 'ulid';
import { comparePassword, encryptPassword } from '../utils';
import { Client } from 'model/Client/client.entity'

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @InjectRepository(Credential)
    private readonly repository: Repository<Credential>,
    @InjectRepository(Client)    // Ajoutez cette injection
    private readonly clientRepository: Repository<Client>,
    private readonly tokenService: TokenService
  ) {}

  // Part detail
  async detail(id: string): Promise<Credential> {
    const result: Credential = await this.repository.findOne({ where: { credential_id: id } });

    if (!isNil(result)) {
      return result;
    }
    throw new UserNotFoundException();
  }

  // Part signIn
  async signIn(payload: SignInPayload, isAdmin: boolean): Promise<Token> {
    try {
      const credential = await this.repository.findOneBy({ mail: payload.mail });

      if (!credential) {
        throw new UserNotFoundException();
      }

      // Trouver le client associé directement avec le repository
      const client = await this.clientRepository.findOne({
        where: { credentialId: credential.credential_id }
      });

      console.log('Client trouvé:', client);

      // Générer le token
      const token = await this.tokenService.getTokens(credential);

      // Ajouter le clientId à la réponse si disponible
      return {
        ...token,
        clientId: client?.clientId
      };
    } catch (error) {
      throw error;
    }
  }
  // Ajout d'une méthode de validation des identifiants
  private async validateCredentials(
    email: string,
    password: string,
    isAdmin: boolean
  ): Promise<Credential> {
    const user = await this.repository.findOneBy({ mail: email });

    if (!user || user.isAdmin !== isAdmin || !(await comparePassword(password, user.password))) {
      throw new UserNotFoundException('Identifiants invalides');
    }

    if (!user.active) {
      throw new UserNotFoundException('Compte désactivé');
    }

    return user;
  }
  async checkUserRole(userId: string, requiredRole: 'admin' | 'client'): Promise<boolean> {
    try {
      const user = await this.detail(userId);
      return requiredRole === 'admin' ? user.isAdmin : !user.isAdmin;
    } catch (error) {
      this.logger.error(`Error checking user role:`, error);
      return false;
    }
  }

  async signup(payload: SignupPayload, isAdmin: boolean = false): Promise<Credential> {
    try {
      // Créer l'objet Credential
      const credential = Builder<Credential>()
        .credential_id(ulid())
        .username(payload.username)
        .password(await encryptPassword(payload.password))
        .mail(payload.mail)
        .isAdmin(isAdmin)
        .active(true)
        .build();

      // Sauvegarder l'objet Credential
      const savedCredential = await this.repository.save(credential);

      // Créer le client si ce n'est pas un admin
      if (!isAdmin) {
        const client = this.clientRepository.create({
          firstName: payload.username,
          lastName: '',
          address: '',
          credential: savedCredential as DeepPartial<Credential>, // Utiliser DeepPartial<Credential>
        });

        await this.clientRepository.save(client);
      }

      return savedCredential;
    } catch (error) {
      if (error instanceof UserAlreadyExistException) {
        throw error; // Relancer l'exception si c'est une UserAlreadyExistException
      }
      this.logger.error(`Error during signup: ${error.message}`);
      throw new SignupException('Erreur lors de la création du compte');
    }
  }
  // Part refresh
  async refresh(payload: RefreshTokenPayload): Promise<Token | null> {
    return this.tokenService.refresh(payload);
  }

  // Part Delete
  async delete(id: string): Promise<void> {
    try {
      const detail = await this.detail(id);
      await this.tokenService.deleteFor(detail);
      await this.repository.remove(detail);
    } catch (e) {
      throw new CredentialDeleteException();
    }
  }
  async findByEmail(email: string): Promise<Credential | null> {
    return this.repository.findOneBy({ mail: email });
  }
}
