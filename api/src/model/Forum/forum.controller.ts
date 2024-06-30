import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { CreateForumDto } from './dto/create-forum.dto';
import { ForumService } from './forum.service';
import { ApiTags } from '@nestjs/swagger'; // Make sure to import ForumService
import { JwtGuard } from '@feature/security';


@ApiTags('forum')
@Controller('forum')
@UseGuards(JwtGuard)
export class ForumController {
  constructor(private readonly forumService: ForumService) {} // Inject ForumService here

  @Post()
  async create(@Body() createForumDto: CreateForumDto) {
    return this.forumService.create(createForumDto);
  }
  // Endpoint to retrieve all forum entries
  @Get()
  async findAll() {
    return this.forumService.findAll();
  }
  // PUT endpoint to update an existing forum entry

}
