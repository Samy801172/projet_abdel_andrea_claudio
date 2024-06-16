import { Controller, Get, Param, Post, Body, NotFoundException } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger'; // Importez les annotations Swagger

import { User } from './user.entity';
import { UserService } from './ user.service';

@ApiTags('users') // Définissez le tag pour ce contrôleur
@Controller('users') // Spécifiez le chemin de base pour les routes de ce contrôleur
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List of all users.', type: [User] })
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'User found.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id') id: number): Promise<User> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post()
  @ApiResponse({ status: 201, description: 'User created.', type: User })
  async create(@Body() user: User): Promise<User> {
    return this.userService.create(user);
  }
}
