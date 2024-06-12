
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreateForumDto } from './create-forum.dto';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post()
  async create(@Body() createForumDto: CreateForumDto) {
    return this.forumService.create(createForumDto);
  }

  @Get()
  async findAll() {
    return this.forumService.findAll();
  }
}
