import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SecurityService } from "./service";
import { Credential, RefreshTokenPayload, SignInPayload, SignupPayload, Token } from './data';
import { Public, User } from "@common/config";

@ApiBearerAuth('access-token')
@ApiTags('Account')
@Controller('account')
export class SecurityController {
  constructor(private readonly service: SecurityService) {}

  @Public()

  @Post('signin')
  public signIn(@Body() payload: SignInPayload): Promise<Token> {
    return this.service.signIn(payload, false);
  }

  @Public()
  @Post('admin-signin')
  public adminSignIn(@Body() payload: SignInPayload): Promise<Token> {
    return this.service.signIn(payload, true);
  }

  @Public()
  @Post('signup')
  public signUp(@Body() payload: SignupPayload): Promise<Credential | null> { // Added missing return type Promise<Token>
    return this.service.signup(payload);
  }

  @Public()
  @Post('refresh')
  public refresh(@Body() payload: RefreshTokenPayload): Promise<Token> {
    return this.service.refresh(payload);
  }

  @Get('me')
  public me(@User() user: Credential): Credential {
    return user;
  }

  @Delete('delete/:id')
  public delete(@Param('id') credential_id: string): Promise<void> {
    return this.service.delete(credential_id);
  }
}
