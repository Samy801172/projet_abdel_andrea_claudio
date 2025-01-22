import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { TokenService } from './token.service';
import { UnauthorizedException } from '@nestjs/common';
import { LoginTicket, OAuth2Client } from "google-auth-library";


import {
  Credential,
  RefreshTokenPayload,
  SignInPayload,
  SignupPayload,
  Token,
} from '@feature/security/data';
import {
  CredentialDeleteException,
  SignupException,
  UserAlreadyExistException,
  UserNotFoundException,
} from '@feature/security/security.exception';
import { Builder } from 'builder-pattern';
import { isNil } from 'lodash';
import { ulid } from 'ulid';
import { comparePassword, encryptPassword } from '../utils';
import { Client } from 'model/Client/client.entity';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @InjectRepository(Credential)
    private readonly repository: Repository<Credential>,
    @InjectRepository(Client) // Ajoutez cette injection
    private readonly clientRepository: Repository<Client>,
    private readonly tokenService: TokenService,
  ) {}

  // Part detail
  async detail(id: string): Promise<Credential> {
    const result: Credential = await this.repository.findOne({
      where: { credential_id: id },
    });

    if (!isNil(result)) {
      return result;
    }
    throw new UserNotFoundException();
  }

  // Part signIn (modifié par Claudio)
  async signIn(payload: SignInPayload, isAdmin: boolean): Promise<Token> {
    try {
      // Validation des identifiants
      const credential = await this.validateCredentials(payload.mail, payload.password, isAdmin);

      // Trouver le client associé directement avec le repository
      const client = await this.clientRepository.findOne({
        where: { credentialId: credential.credential_id },
      });

      console.log('Client trouvé:', client);

      // Générer le token
      const token = await this.tokenService.getTokens(credential);

      // Ajouter le clientId à la réponse si disponible
      return {
        ...token,
        clientId: client?.clientId,
      };
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw new UserNotFoundException('Email ou mot de passe incorrect');
      }
      this.logger.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }

  // Ajout d'une méthode de validation des identifiants
  private async validateCredentials(
    email: string,
    password: string,
    isAdmin: boolean,
  ): Promise<Credential> {
    const user = await this.repository.findOneBy({ mail: email });

    if (!user) {
      throw new UserNotFoundException('Utilisateur introuvable');
    }

    if (user.isAdmin !== isAdmin) {
      throw new UserNotFoundException('Accès refusé : rôle non autorisé');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UserNotFoundException('Identifiants invalides');
    }

    if (!user.active) {
      throw new UserNotFoundException('Compte désactivé');
    }

    return user;
  }

  //Authentification google Service
  async googleSignIn(credential: string): Promise<Token> {
    try {
      const ticket = await this.verifyGoogleToken(credential);
      const payload = ticket.getPayload();
      console.log('Payload Google:', payload);

      const email = payload?.email;
      if (!email) {
        throw new UnauthorizedException('Le token Google ne contient pas d\'email valide.');
      }

      let user = await this.repository.findOneBy({ mail: email });
      if (!user) {
        // Générer un credential_id
        const credentialId = ulid();
        console.log('Generated credential_id:', credentialId);

        // Créer un nouvel utilisateur
        user = this.repository.create({
          credential_id: credentialId,
          mail: email,
          username: payload?.given_name || 'Utilisateur Google',
          isAdmin: false,
          active: true,
        });
        user = await this.repository.save(user);
        console.log('User created successfully:', user);

        // Créer un client associé
        const client = this.clientRepository.create({
          credentialId: user.credential_id,
          firstName: payload?.given_name || '',
          lastName: payload?.family_name || '',
          address: '',
          avatar: '/api/assets/uploads/default.jpg',
        });
        await this.clientRepository.save(client);
        console.log('Client created successfully:', client);
      }

      // Générer un token
      const token = await this.tokenService.getTokens(user);
      console.log('Generated token:', token);
      return token;
    } catch (error) {
      this.logger.error('Google sign-in error:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }


  private async verifyGoogleToken(token: string): Promise<LoginTicket> {
    const client = new OAuth2Client('895412895151-8h0gn8669voga5e58rmqbibu01bd9v9d.apps.googleusercontent.com');
    return client.verifyIdToken({
      idToken: token,
      audience: '895412895151-8h0gn8669voga5e58rmqbibu01bd9v9d.apps.googleusercontent.com',
    });
  }
  //Signup pour le client
  async signup(
    payload: SignupPayload,
    isAdmin: boolean = false,
   ): Promise<Credential> {
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
          avatar: '/api/assets/uploads/default.jpg', // Ajout de l'avatar par défaut
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

  // Signup pour l'admin
  async signupAdmin(
    payload: SignupPayload,
    isAdmin: boolean = true,
  ): Promise<Credential> {
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
      // ici modifié par claudio pour qu'un admin sois créé en tant que tel
      if (isAdmin) {
        const client = this.clientRepository.create({
          firstName: payload.username,
          lastName: '',
          address: '',
          avatar: '/api/assets/uploads/default.jpg', // Ajout de l'avatar par défaut
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