import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UnauthorizedException } from '@nestjs/common';

import { SecurityService } from './service';
import {
  Credential,
  RefreshTokenPayload,
  SignInPayload,
  SignupPayload,
  Token,
} from './data';
import { Public, User } from '@common/config';
import { JwtGuard } from '@feature/security/guard';
import { ConflictException } from '@nestjs/common';

interface CheckEmailResponse {
  exists: boolean;
}

@ApiBearerAuth('access-token')
@ApiTags('Account')
@Controller('account')
export class SecurityController {
  private readonly logger = new Logger(SecurityController.name);
  constructor(private readonly service: SecurityService) {}

  @Public()
  @Post('signin')
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully.',
    type: Token,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  public async signIn(@Body() payload: SignInPayload): Promise<Token> {
    this.logger.debug(`SignIn payload: ${JSON.stringify(payload)}`);
    try {
      const token = await this.service.signIn(payload, false);
      this.logger.debug(`SignIn successful: ${JSON.stringify(token)}`);
      return token;
    } catch (error) {
      this.logger.error(`SignIn error: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Post('admin-signin')
  @ApiResponse({
    status: 200,
    description: 'Admin signed in successfully.',
    type: Token,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  public async adminSignIn(@Body() payload: SignInPayload): Promise<Token> {
    this.logger.debug(`AdminSignIn payload: ${JSON.stringify(payload)}`);
    try {
      const token = await this.service.signIn(payload, true);
      this.logger.debug(`AdminSignIn successful: ${JSON.stringify(token)}`);
      return token;
    } catch (error) {
      this.logger.error(`AdminSignIn error: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Post('signup')
  @ApiResponse({
    status: 201,
    description: 'User signed up successfully.',
    type: Credential,
  })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  public async signUp(@Body() payload: SignupPayload): Promise<Credential> {
    this.logger.debug(`SignUp payload: ${JSON.stringify(payload)}`);
    try {
      const credential = await this.service.signup(payload);
      if (!credential) {
        throw new ConflictException(
          "Erreur lors de l'inscription. Utilisateur déjà existant.",
        );
      }
      this.logger.debug(`SignUp successful: ${JSON.stringify(credential)}`);
      return credential;
    } catch (error) {
      this.logger.error(`SignUp error: ${error.message}`);
      throw error;
    }
  }

  // authentification google Backend by Claudio
  @Post('google-login')
  @Public()
  @ApiResponse({ status: 200, description: 'Google login successful.', type: Token })
  @ApiResponse({ status: 401, description: 'Invalid Google token.' })
  public async googleLogin(@Body('credential') credential: string): Promise<Token> {
    try {
      return this.service.googleSignIn(credential);
    } catch (error) {
      this.logger.error(`Google login error: ${error.message}`);
      throw new UnauthorizedException('Invalid Google token');
    }
  }


  @Public()
  @Post('admin-signup')
  @ApiResponse({
    status: 201,
    description: 'User signed up successfully.',
    type: Credential,
  })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  public async adminSignUp(@Body() payload: SignupPayload): Promise<Credential> {
    this.logger.debug(`SignUp payload: ${JSON.stringify(payload)}`);
    try {
      const credential = await this.service.signupAdmin(payload);
      if (!credential) {
        throw new ConflictException(
          "Erreur lors de l'inscription. Utilisateur déjà existant.",
        );
      }
      this.logger.debug(`SignUp successful: ${JSON.stringify(credential)}`);
      return credential;
    } catch (error) {
      this.logger.error(`SignUp error: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Post('refresh')
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully.',
    type: Token,
  })
  public refresh(@Body() payload: RefreshTokenPayload): Promise<Token> {
    return this.service.refresh(payload);
  }

  //UseGuards(JwtGuard) // Protège cette route avec JwtGuard
  @Get('me')
  @ApiResponse({ status: 200, description: 'User details.', type: Credential })
  public me(@User() user: Credential): Credential {
    return user;
  }

  @UseGuards(JwtGuard) // Protège cette route avec JwtGuard
  @Delete('delete/:id')
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public delete(@Param('id') credential_id: string): Promise<void> {
    return this.service.delete(credential_id);
  }

  @Public()
  @Get('check-email/:email') // Changé de POST à GET
  @ApiResponse({ status: 200, description: 'Check if user exists' })
  public async checkEmail(
    @Param('email') email: string,
  ): Promise<{ exists: boolean }> {
    try {
      const user = await this.service.findByEmail(email);
      return { exists: !!user };
    } catch (error) {
      this.logger.error(`CheckEmail error: ${error.message}`);
      throw error;
    }
  }
}
