import { Controller, Get, Post, Body } from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreateForumDto } from './create-forum.dto';

// The controller for forum-related endpoints
@Controller('forum')
export class ForumController {
  // Injecting the ForumService
  constructor(private readonly forumService: ForumService) {}

  // Endpoint to create a new forum entry
  @Post()
  async create(@Body() createForumDto: CreateForumDto) {
    return this.forumService.create(createForumDto);
  }

  // Endpoint to retrieve all forum entries
  @Get()
  async findAll() {
    return this.forumService.findAll();
  }
}
