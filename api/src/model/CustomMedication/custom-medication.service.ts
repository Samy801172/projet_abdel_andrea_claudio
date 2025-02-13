import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomMedication } from './custom-medication.entity';
import { CreateCustomMedicationDto } from './dto/create-custom-medication.dto';
import { CustomMedicationResponse } from './interfaces/custom-medication.interface';

@Injectable()
export class CustomMedicationService {
  constructor(
    @InjectRepository(CustomMedication)
    private readonly customMedicationRepo: Repository<CustomMedication>
  ) {}

  async submitRequest(
    clientId: number,
    createDto: CreateCustomMedicationDto, 
    prescriptionFile?: Express.Multer.File
  ): Promise<CustomMedicationResponse> {
    if (!createDto.description) {
      throw new BadRequestException('La description est requise');
    }

    const customMedication = new CustomMedication();
    customMedication.clientId = clientId;
    customMedication.description = createDto.description;
    customMedication.instructions = createDto.instructions;
    customMedication.estimatedPrice = createDto.estimatedPrice;
    customMedication.status = 'pending';
    customMedication.isPaid = false;
    customMedication.amount = createDto.estimatedPrice;

    if (prescriptionFile) {
      // TODO: Implémenter la sauvegarde du fichier
      customMedication.prescriptionPath = prescriptionFile.filename;
    }

    const saved = await this.customMedicationRepo.save(customMedication);

    // Envoyer une notification à l'administrateur
    // TODO: Implémenter l'envoi de notification

    return {
      ...saved,
      status: saved.status as 'pending' | 'in_progress' | 'quality_check' | 'completed'
    };
  }
} 