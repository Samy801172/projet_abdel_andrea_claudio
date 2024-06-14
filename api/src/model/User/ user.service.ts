// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async findOne(id: number): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id_user: id });
    if (!user) {
      return null;
    }
    return user;
  }

  async create(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  update(id: number, user: User): Promise<void> {
    return this.userRepository.update(id, user).then(() => undefined);
  }

  remove(id: number): Promise<void> {
    return this.userRepository.delete(id).then(() => undefined);
  }
}
