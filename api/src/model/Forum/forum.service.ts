import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Forum } from './forum.entity';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';

@Injectable()
export class ForumService {
  constructor(
      @InjectRepository(Forum)
      private readonly forumRepository: Repository<Forum>,
  ) {}

  async create(createForumDto: CreateForumDto): Promise<Forum> {
    const forum = new Forum();
    forum.name = createForumDto.name;
    forum.description = createForumDto.description;
    forum.date_message_forum = createForumDto.date_message;
    forum.hour_message_forum = createForumDto.hour_message;
    return this.forumRepository.save(forum);
  }

  async findAll(): Promise<Forum[]> {
    return this.forumRepository.find();
  }
  async findOne(id: number): Promise<Forum | null> {
    const forum = await this.forumRepository.findOne({ where: { id_forum: id } });
    if (!forum) {
      throw new NotFoundException(`Forum with ID ${id} not found`);
    }
    return forum;
  }
  async update(id: number, updateForumDto: UpdateForumDto): Promise<Forum> {
    const existingForum = await this.forumRepository.findOne({ where: { id_forum: id } });
    if (!existingForum) {
      throw new NotFoundException(`Forum with ID ${id} not found`);
    }

    existingForum.name = updateForumDto.name || existingForum.name;
    existingForum.description = updateForumDto.description || existingForum.description;
    existingForum.date_message_forum = updateForumDto.date_message || existingForum.date_message_forum;
    existingForum.hour_message_forum = updateForumDto.hour_message || existingForum.hour_message_forum;

    return this.forumRepository.save(existingForum);
  }

  async remove(id: number): Promise<void> {
    const forum = await this.forumRepository.findOne({ where: { id_forum: id } });
    if (!forum) {
      throw new NotFoundException(`Forum with ID ${id} not found`);
    }
    await this.forumRepository.remove(forum);
  }
}
