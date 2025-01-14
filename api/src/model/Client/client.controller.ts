// src/controllers/client.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Param,
  Delete,
  Put,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientService } from './client.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';

// Pour l'upload fichier
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';
import { Client } from './client.entity';


// Configuration Multer pour gérer les fichiers
export const multerOptions = {
  storage: diskStorage({
    destination: './assets/uploads', // Dossier où les fichiers seront sauvegardés
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      callback(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    // Vérification du type de fichier (seules les images sont autorisées)
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      return callback(new BadRequestException('Ce fichier n\'est pas autorisé !'), false);
    }
    callback(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // Limite de taille : 2MB
  },
};

@Controller('files')
export class FileController {
  @Get('avatar/:filename')
  getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(__dirname, '..', 'assets', 'uploads', filename);

    // Vérifiez si le fichier existe
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    } else {
      return res.status(404).send('Fichier non trouvé');
    }
  }
}

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

  // je récupère les clients inscrit
  @Get('TousClients')
  TousLesClients() {
    return this.clientService.findAll();
  }

  // pour mettre un client Admin ou enlever l'Admin
  @Put(':id/putAdmin')
  async updateforAdmin(
    @Param('id') id: number,
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<Client> {
    return this.clientService.updateIsAdmin(id, updateProfileDto);
  }

  // Récupérer commandes d'un client
  @Get(':id/orders')
  async getClientOrders(@Param('id') id: number): Promise<any[]> {
    const orders = await this.clientService.getClientOrders(id);
    if (!orders || orders.length === 0) {
      throw new NotFoundException(`Aucune commande trouvée pour le client ID ${id}`);
    }
    return orders;
  }

  // C'est ici qu'on récupère le client par son clientId
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

  // pour mettre à jour le profil utilisateur (Claudio)
  @Put(':id/updateProfile')
  updateProfileUser(@Param('id') id: number, @Body() updateProfileDto: UpdateProfileDto) {
    return this.clientService.updateProfile(id, updateProfileDto);
  }

  // pour uploader l'avatar (Claudio)
  @Post('profile/:clientId/avatar')
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  async updateAvatar(
    @Param('clientId') clientId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('Client ID reçu :', clientId);
    console.log('Fichier reçu :', file);

    if (!file) {
      throw new BadRequestException('Aucun fichier uploadé.');
    }

    const filePath = `/api/assets/uploads/${file.filename}`;

    const updatedClient = await this.clientService.updateAvatar(parseInt(clientId, 10), filePath);

    console.log('Client mis à jour :', updatedClient);

    if (!updatedClient) {
      throw new NotFoundException('Client non trouvé.');
    }

    return {
      message: 'Avatar mis à jour avec succès.',
      avatarPath: `http://localhost:2024${filePath}`,
    };
  }
}
