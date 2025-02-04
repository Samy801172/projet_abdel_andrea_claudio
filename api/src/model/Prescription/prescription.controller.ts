import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile, Put
} from "@nestjs/common";
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}


  ///////////////////////CLIENT////////////////////////////////////

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './assets/uploads/prescriptions',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  async uploadPrescription(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPrescriptionDto: CreatePrescriptionDto,
  ) {
    console.log('=== Début de uploadPrescription ===');
    console.log('Fichier reçu :', file);
    console.log('Données reçues :', createPrescriptionDto);

    try {
      if (!file) {
        console.error('Erreur : Aucun fichier reçu.');
        throw new HttpException('Aucun fichier reçu.', HttpStatus.BAD_REQUEST);
      }

      // Ajoute le chemin du fichier
      createPrescriptionDto.file_url = `/assets/uploads/prescriptions/${file.filename}`;

      // Vérifie et définit une valeur par défaut pour expiry_date
      if (!createPrescriptionDto.expiry_date) {
        createPrescriptionDto.expiry_date = new Date(); // Exemple : utilise la date actuelle comme valeur par défaut
        console.log('Date d\'expiration par défaut ajoutée :', createPrescriptionDto.expiry_date);
      }

      const newPrescription = await this.prescriptionService.create(createPrescriptionDto);
      console.log('Prescription sauvegardée :', newPrescription);

      return {
        message: 'Ordonnance uploadée avec succès',
        prescription: newPrescription,
      };
    } catch (error) {
      console.error('Erreur dans uploadPrescription :', error.message);
      throw new HttpException(
        {
          message: 'Erreur lors de l\'upload de l\'ordonnance.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':client_id')
  async findByClient(@Param('client_id') clientId: number) {
    try {
      const prescriptions = await this.prescriptionService.findByClient(clientId);
      return prescriptions;
    } catch (error) {
      console.error('Erreur lors de la récupération des ordonnances pour le client :', error.message);
      throw new HttpException(
        'Erreur lors de la récupération des ordonnances.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  @Get()
  async findAll() {
    return this.prescriptionService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.prescriptionService.remove(+id);
  }


  ///////////////////////ADMIN////////////////////////////////////

  // 🔹 Mettre à jour le statut d’une prescription
  @Put(':id/update-status')
  async updateStatus(
    @Param('id') id: number,
    @Body('status') status: string,
    @Body('verified_by') verifiedBy: number, // ID de l'admin qui vérifie
  ) {
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      throw new HttpException('Statut invalide', HttpStatus.BAD_REQUEST);
    }

    return this.prescriptionService.updateStatus(id, status, verifiedBy);
  }

}
