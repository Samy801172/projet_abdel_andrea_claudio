import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    console.log('Données reçues pour la création :', createPrescriptionDto);

    try {
      const prescription = this.prescriptionRepository.create(createPrescriptionDto);
      console.log('Objet prescription créé :', prescription);

      const savedPrescription = await this.prescriptionRepository.save(prescription);
      console.log('Prescription sauvegardée avec succès :', savedPrescription);

      return savedPrescription;
    } catch (error) {
      console.error('Erreur lors de la création de la prescription :', error);
      throw error;
    }
  }

  async findByClient(clientId: number): Promise<Prescription[]> {
    try {
      return await this.prescriptionRepository.find({ where: { client_id: clientId } });
    } catch (error) {
      console.error('Erreur lors de la récupération des prescriptions :', error.message);
      throw new Error('Erreur lors de la récupération des prescriptions.');
    }
  }



  findAll() {
    return this.prescriptionRepository.find();
  }

  remove(id: number) {
    return this.prescriptionRepository.delete(id);
  }
}
