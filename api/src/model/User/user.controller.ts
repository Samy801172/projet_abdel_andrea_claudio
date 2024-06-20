import { Controller, Get,Put, Delete, Param, Post, Body, NotFoundException, ValidationPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './user.entity';
import { CreateUserDto} from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

import { UserService } from './ user.service';

@ApiTags('users')
@Controller('users')
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

  @Post('creat')
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: User })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<User> {
    // Transform createUserDto into a User entity
    const user = new User();
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.email = createUserDto.email;
    user.phone = createUserDto.phone;
    user.type_user = createUserDto.type_user;
    user.password_user = createUserDto.password;

    return this.userService.create(user);
  }
  @Put(':id')
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async update(@Param('id') id: number, @Body(ValidationPipe) updateUserDto: Partial<User>): Promise<User> {
    const user = await this.userService.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }


  @Delete(':id')
  @ApiResponse({ status: 204, description: 'The user has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async delete(@Param('id') id: number): Promise<void> {
    await this.userService.delete(id);
  }
}
