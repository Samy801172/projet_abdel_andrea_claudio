import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Forum } from './forum.entity';
import { CreateForumDto } from './create-forum.dto';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
  ) {}

  async create(createForumDto: CreateForumDto): Promise<Forum> {
    const forum = new Forum();
    forum.date_message = createForumDto.date_message;
    forum.hour_message = createForumDto.hour_message;
    return this.forumRepository.save(forum);
  }

  async findAll(): Promise<Forum[]> {
    return this.forumRepository.find();
  }

}
