import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { compare } from 'bcrypt';
import { TokenService } from './token.service';
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
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(Credential)
    private readonly repository: Repository<Credential>,
    @InjectRepository(Client) // Ajoutez cette injection
    private readonly clientRepository: Repository<Client>,
    private readonly tokenService: TokenService,

  ) {
    {
      // Initialisation de googleClient avec le Client ID de Google
      this.googleClient = new OAuth2Client('895412895151-8h0gn8669voga5e58rmqbibu01bd9v9d.apps.googleusercontent.com');
    }
  }

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
      // Récupérer l'utilisateur par son email
      const credential = await this.repository.findOneBy({
        mail: payload.mail,
      });

      if (!credential) {
        throw new UserNotFoundException('Utilisateur introuvable');
      }

      // Vérifier si l'utilisateur a le rôle attendu
      if (credential.isAdmin !== isAdmin) {
        throw new UserNotFoundException('Rôle incorrect');
      }

      // Vérifier le mot de passe
      const isPasswordValid = await compare(payload.password, credential.password);
      if (!isPasswordValid) {
        throw new UserNotFoundException('Mot de passe incorrect');
      }

      // Trouver le client associé pour les utilisateurs non admin
      let client = null;
      if (!credential.isAdmin) {
        client = await this.clientRepository.findOne({
          where: { credentialId: credential.credential_id },
        });
        console.log('Client trouvé:', client);
      }

      // Générer le token
      const token = await this.tokenService.getTokens(credential);

      // Retourner le token avec le clientId si applicable
      return {
        ...token,
        clientId: client?.clientId || null,
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error.message);
      throw error;
    }
  }

  /**
   * Vérifie le jeton Google et retourne un token JWT pour l'utilisateur.
   * @param googleToken Jeton ID Google envoyé par le frontend
   * @returns Token JWT
   */
  async verifyGoogleToken(googleToken: string): Promise<Token> {
    try {
      // Vérifiez le jeton Google avec le client OAuth
      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleToken,
        audience: '895412895151-8h0gn8669voga5e58rmqbibu01bd9v9d.apps.googleusercontent.com',
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Jeton Google invalide');
      }

      // Chercher l'utilisateur par email
      let user = await this.repository.findOneBy({ mail: payload.email });

      // Si l'utilisateur n'existe pas, le créer en tant que client
      if (!user) {
        const newUser = this.repository.create({
          credential_id: ulid(),
          mail: payload.email,
          username: payload.name || 'Utilisateur Google',
          password: null, // Pas de mot de passe pour Google
          isAdmin: false, // Toujours client
          active: true,
        });

        user = await this.repository.save(newUser);

        // Créer le client associé
        const newClient = this.clientRepository.create({
          firstName: payload.given_name || 'Prénom',
          lastName: payload.family_name || 'Nom',
          address: '', // Vous pouvez le demander plus tard
          credential: user,
        });

        await this.clientRepository.save(newClient);

        this.logger.debug(`Nouvel utilisateur créé via Google: ${user.mail}`);
      } else if (user.isAdmin) {
        // Si l'utilisateur est admin, refuser la connexion via Google
        throw new UnauthorizedException('Seuls les clients peuvent se connecter via Google');
      }

      // Générer un token JWT pour l'utilisateur
      const token = await this.tokenService.getTokens(user);

      this.logger.debug(`Connexion Google réussie pour l'utilisateur: ${user.mail}`);
      return token;
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification du jeton Google: ${error.message}`);
      throw new UnauthorizedException('Connexion Google échouée');
    }
  }



  // Ajout d'une méthode de validation des identifiants
  private async validateCredentials(
    email: string,
    password: string,
    isAdmin: boolean,
  ): Promise<Credential> {
    const user = await this.repository.findOneBy({ mail: email });

    if (
      !user ||
      user.isAdmin !== isAdmin ||
      !(await comparePassword(password, user.password))
    ) {
      throw new UserNotFoundException('Identifiants invalides');
    }

    if (!user.active) {
      throw new UserNotFoundException('Compte désactivé');
    }

    return user;
  }
  async checkUserRole(
    userId: string,
    requiredRole: 'admin' | 'client',
  ): Promise<boolean> {
    try {
      const user = await this.detail(userId);
      return requiredRole === 'admin' ? user.isAdmin : !user.isAdmin;
    } catch (error) {
      this.logger.error(`Error checking user role:`, error);
      return false;
    }
  }

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
