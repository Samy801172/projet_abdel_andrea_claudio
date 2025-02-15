// src/controllers/type.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { TypeService } from './type.service';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

// Documentation Swagger pour catégoriser les routes sous "types"
@ApiTags('types')
@ApiBearerAuth('access-token') // Indique que ce contrôleur nécessite un token d'accès
@Controller('types')
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  // Création d'un nouveau type
  @Post()
  create(@Body() createTypeDto: CreateTypeDto) {
    return this.typeService.create(createTypeDto);
  }

  // Récupération de tous les types
  @Get()
  findAll() {
    return this.typeService.findAll();
  }

  // Récupération d'un type spécifique par son ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeService.findOne(+id);
  }

  // Mise à jour d'un type existant
  @Put(':id')
  update(@Param('id') id: string, @Body() updateTypeDto: UpdateTypeDto) {
    return this.typeService.update(+id, updateTypeDto);
  }

  // Suppression d'un type avec validation de l'ID
  @Delete(':id')
  async remove(
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory: () => new BadRequestException('ID invalide'),
      }),
    )
    id: number,
  ) {
    return this.typeService.remove(id);
  }
}