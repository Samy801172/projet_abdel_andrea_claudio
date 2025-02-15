import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrescriptionStatus } from './prescription.entity';

@Injectable()
export class PrescriptionService {
  constructor(
    // Injection du repository TypeORM pour la gestion des prescriptions
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
  ) {}

  // Création d'une nouvelle prescription
  async create(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    console.log('Données reçues pour la création :', createPrescriptionDto);

    try {
      // Création d'une instance de Prescription à partir du DTO
      const prescription = this.prescriptionRepository.create(createPrescriptionDto);
      console.log('Objet prescription créé :', prescription);

      // Sauvegarde de la prescription en base de données
      const savedPrescription = await this.prescriptionRepository.save(prescription);
      console.log('Prescription sauvegardée avec succès :', savedPrescription);

      return savedPrescription;
    } catch (error) {
      console.error('Erreur lors de la création de la prescription :', error);
      throw error;
    }
  }

  // Récupération des prescriptions d'un client spécifique
  async findByClient(clientId: number): Promise<Prescription[]> {
    try {
      return await this.prescriptionRepository.find({ where: { client_id: clientId } });
    } catch (error) {
      console.error('Erreur lors de la récupération des prescriptions :', error.message);
      throw new Error('Erreur lors de la récupération des prescriptions.');
    }
  }

  // Récupère toutes les prescriptions avec les relations clients
  async findAll(): Promise<Prescription[]> {
    const prescriptions = await this.prescriptionRepository.find({
      relations: ['client'], // Charge la relation avec Client
    });
    console.log('Prescriptions retournées :', prescriptions);
    return prescriptions;
  }

  // Mise à jour du statut d'une prescription par un administrateur
  async updateStatus(id: number, status: string, verifiedBy: number): Promise<Prescription> {
    // Recherche de la prescription par ID
    const prescription = await this.prescriptionRepository.findOne({ where: { id_prescription: id } });

    if (!prescription) {
      throw new Error('Prescription non trouvée');
    }

    // Mise à jour des champs de statut et vérification
    prescription.status = status as PrescriptionStatus; // ✅ Convertit string en enum
    prescription.verified_by = verifiedBy;
    prescription.verification_date = new Date();

    // Sauvegarde des modifications en base de données
    return this.prescriptionRepository.save(prescription);
  }

  // Suppression d'une prescription
  remove(id: number) {
    return this.prescriptionRepository.delete(id);
  }
}
