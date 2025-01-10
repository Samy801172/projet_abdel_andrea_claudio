// src/controllers/client.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';

import { ClientService } from './client.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';

// pour récupérer le clientId

@ApiTags('clients')
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  findAll() {
    return this.clientService.findAll();
  }

  // C'est ici qu'on récupère le client par son clientid
  @Get('profile/:clientId')
  async findProfile(@Param('clientId') clientId: string) {
    console.log('Recherche du client avec clientId :', clientId);

    // Conversion de clientId en nombre
    const clientIdNumber = parseInt(clientId, 10);

    if (isNaN(clientIdNumber)) {
      console.error('clientId doit être un nombre valide.');
      throw new BadRequestException('clientId doit être un nombre valide.');
    }

    // Appel de la méthode basée sur clientId
    const client = await this.clientService.findProfileById(clientIdNumber);

    if (!client) {
      console.error('Client non trouvé pour clientId :', clientIdNumber);
      throw new NotFoundException('Client non trouvé');
    }

    console.log('Client trouvé :', client);
    return client;
  }
  @Get('credential/:credentialId')
  async findByCredentialId(@Param('credentialId') credentialId: string) {
    const client = await this.clientService.findByCredentialId(credentialId);
    if (!client) {
      throw new NotFoundException('Client non trouvé');
    }
    return client;
  }
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.clientService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.clientService.remove(id);
  }

  // pour mettre à jour le profil utilisateur
  @Put(':id/updateProfile')
  updateProfileUser(@Param('id') id: number, @Body() updateProfileDto: UpdateProfileDto) {
    return this.clientService.updateProfile(id, updateProfileDto);
  }
}
