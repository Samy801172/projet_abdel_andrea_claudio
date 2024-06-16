import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "model/User/ user.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    // Convertissez `username` en nombre si c'est un ID numérique
    const userId = parseInt(username);
    // Utilisez `userId` pour appeler `findOne`
    const user = await this.usersService.findOne(userId);
    if (user && user.password === pass) { // Ajoutez une vérification de mot de passe haché en production
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
