import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiBearerAuth('access-token')
@ApiTags('Account')
@Controller('account')
export class SecurityController {
  private readonly logger = new Logger(SecurityController.name);

  constructor(private readonly service: SecurityService) {}

  // User SignIn
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
      const token = await this.service.signIn(payload, false); // Client login
      this.logger.debug(`SignIn successful: ${JSON.stringify(token)}`);
      return token;
    } catch (error) {
      this.logger.error(`SignIn error: ${error.message}`);
      throw error;
    }
  }

  // Admin SignIn
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
      const token = await this.service.signIn(payload, true); // Admin login
      this.logger.debug(`AdminSignIn successful: ${JSON.stringify(token)}`);
      return token;
    } catch (error) {
      this.logger.error(`AdminSignIn error: ${error.message}`);
      throw error;
    }
  }

  // Google Login
  @Public()
  @Post('google-login')
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully with Google.',
    type: Token,
  })
  @ApiResponse({ status: 401, description: 'Google token is invalid.' })
  public async googleLogin(@Body('credential') googleCredential: string): Promise<Token> {
    try {
      const token = await this.service.verifyGoogleToken(googleCredential);
      this.logger.debug(`Google Login successful: ${JSON.stringify(token)}`);
      return token;
    } catch (error) {
      this.logger.error(`Google Login error: ${error.message}`);
      throw new UnauthorizedException('Connexion Google échouée');
    }
  }

  // User Signup
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
        throw new ConflictException("Erreur lors de l'inscription. Utilisateur déjà existant.");
      }
      this.logger.debug(`SignUp successful: ${JSON.stringify(credential)}`);
      return credential;
    } catch (error) {
      this.logger.error(`SignUp error: ${error.message}`);
      throw error;
    }
  }

  // Admin Signup
  @Public()
  @Post('admin-signup')
  @ApiResponse({
    status: 201,
    description: 'Admin signed up successfully.',
    type: Credential,
  })
  @ApiResponse({ status: 409, description: 'Admin already exists.' })
  public async adminSignUp(@Body() payload: SignupPayload): Promise<Credential> {
    try {
      const credential = await this.service.signup(payload, true);
      if (!credential) {
        throw new ConflictException("Erreur lors de l'inscription de l'admin.");
      }
      this.logger.debug(`AdminSignUp successful: ${JSON.stringify(credential)}`);
      return credential;
    } catch (error) {
      this.logger.error(`AdminSignUp error: ${error.message}`);
      throw error;
    }
  }

  // Refresh Tokens
  @Public()
  @Post('refresh')
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully.',
    type: Token,
  })
  public async refresh(@Body() payload: RefreshTokenPayload): Promise<Token> {
    try {
      const token = await this.service.refresh(payload);
      this.logger.debug(`Refresh token successful: ${JSON.stringify(token)}`);
      return token;
    } catch (error) {
      this.logger.error(`Refresh token error: ${error.message}`);
      throw error;
    }
  }

  // Get User Info
  @UseGuards(JwtGuard)
  @Get('me')
  @ApiResponse({ status: 200, description: 'User details.', type: Credential })
  public me(@User() user: Credential): Credential {
    return user;
  }

  // Delete User
  @UseGuards(JwtGuard)
  @Delete('delete/:id')
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public async delete(@Param('id') credential_id: string): Promise<void> {
    try {
      await this.service.delete(credential_id);
      this.logger.debug(`User with ID ${credential_id} deleted successfully.`);
    } catch (error) {
      this.logger.error(`Delete user error: ${error.message}`);
      throw error;
    }
  }

  // Check if Email Exists
  @Public()
  @Get('check-email/:email')
  @ApiResponse({ status: 200, description: 'Check if user exists.' })
  public async checkEmail(@Param('email') email: string): Promise<{ exists: boolean }> {
    try {
      const user = await this.service.findByEmail(email);
      return { exists: !!user };
    } catch (error) {
      this.logger.error(`CheckEmail error: ${error.message}`);
      throw error;
    }
  }
}
