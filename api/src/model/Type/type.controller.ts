// src/controllers/type.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, HttpStatus, BadRequestException } from '@nestjs/common';
import { TypeService } from './type.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('types')
@ApiBearerAuth('access-token') // Indique que ce contrôleur nécessite un token d'accès
@Controller('types')
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  @Post()
  create(@Body() createTypeDto: CreateTypeDto) {
    return this.typeService.create(createTypeDto);
  }

  @Get()
  findAll() {
    return this.typeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTypeDto: UpdateTypeDto) {
    return this.typeService.update(+id, updateTypeDto);
  }

// Dans le backend (NestJS)
  @Delete(':id')
  async remove(@Param('id', new ParseIntPipe({
    errorHttpStatusCode: HttpStatus.BAD_REQUEST,
    exceptionFactory: () => new BadRequestException('ID invalide')
  })) id: number) {
    return this.typeService.remove(id);
  }
}
