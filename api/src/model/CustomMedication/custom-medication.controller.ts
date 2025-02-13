import { Controller, Post, Body, UseGuards, UploadedFile, UseInterceptors, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '@feature/security';
import { ApiTags } from '@nestjs/swagger';
import { CustomMedicationService } from './custom-medication.service';
import { CreateCustomMedicationDto } from './dto/create-custom-medication.dto';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Custom Medications')
@Controller('custom-medications')
@UseGuards(JwtGuard)
export class CustomMedicationController {
  constructor(private readonly customMedicationService: CustomMedicationService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('prescription', {
      storage: diskStorage({
        destination: './uploads/prescriptions',
        filename: (req, file, callback) => {
          console.log('Fichier reçu:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const filename = `${uniqueSuffix}${extname(file.originalname)}`;
          console.log('Nom du fichier généré:', filename);
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/)) {
          return callback(new Error('Seuls les fichiers PDF et images sont autorisés'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
      }
    }),
  )
  async submitCustomRequest(
    @Req() request,
    @Body('data') dataString: string,
    @UploadedFile() prescriptionFile?: Express.Multer.File
  ) {
    console.log('Données reçues:', {
      dataString,
      file: prescriptionFile ? {
        filename: prescriptionFile.filename,
        mimetype: prescriptionFile.mimetype,
        size: prescriptionFile.size
      } : null
    });

    let createDto: CreateCustomMedicationDto;
    try {
      createDto = JSON.parse(dataString);
      console.log('DTO parsé:', createDto);
    } catch (error) {
      console.error('Erreur de parsing JSON:', error);
      throw new BadRequestException('Format de données invalide');
    }

    if (!createDto.description || !createDto.estimatedPrice) {
      throw new BadRequestException('Description et prix estimé requis');
    }

    try {
      const result = await this.customMedicationService.submitRequest(
        request.user.clientId,
        createDto,
        prescriptionFile
      );
      console.log('Résultat:', result);
      return result;
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      throw error;
    }
  }
} 