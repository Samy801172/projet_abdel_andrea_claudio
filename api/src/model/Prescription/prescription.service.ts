// src/model/Prescription/prescription.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription, PrescriptionStatus } from './prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { Client } from '../Client/client.entity';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(
    createPrescriptionDto: CreatePrescriptionDto,
  ): Promise<Prescription> {
    const client = await this.clientRepository.findOne({
      where: { clientId: createPrescriptionDto.client_id },
    });

    if (!client) {
      throw new NotFoundException(
        `Client with ID ${createPrescriptionDto.client_id} not found`,
      );
    }

    const prescription = this.prescriptionRepository.create({
      client_id: client.clientId,
      prescribed_by: createPrescriptionDto.prescribed_by,
      medication_details: createPrescriptionDto.medication_details,
      expiry_date:
        createPrescriptionDto.expiry_date ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
      file_url: createPrescriptionDto.file_url,
      is_custom: createPrescriptionDto.is_custom,
      notes: createPrescriptionDto.notes,
      status: PrescriptionStatus.PENDING,
    });

    const savedPrescription =
      await this.prescriptionRepository.save(prescription);
    return this.findOne(savedPrescription.id_prescription);
  }

  async findAll(): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      relations: ['client'],
      order: {
        issue_date: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id_prescription: id },
      relations: ['client'],
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription #${id} not found`);
    }

    return prescription;
  }

  async update(
    id: number,
    updatePrescriptionDto: UpdatePrescriptionDto,
  ): Promise<Prescription> {
    const prescription = await this.findOne(id);

    if (updatePrescriptionDto.client_id) {
      const client = await this.clientRepository.findOne({
        where: { clientId: updatePrescriptionDto.client_id },
      });

      if (!client) {
        throw new NotFoundException(
          `Client #${updatePrescriptionDto.client_id} not found`,
        );
      }

      prescription.client_id = client.clientId;
    }

    // Mise à jour des autres champs
    const updatedPrescription = {
      ...prescription,
      prescribed_by:
        updatePrescriptionDto.prescribed_by ?? prescription.prescribed_by,
      medication_details:
        updatePrescriptionDto.medication_details ??
        prescription.medication_details,
      expiry_date:
        updatePrescriptionDto.expiry_date ?? prescription.expiry_date,
      file_url: updatePrescriptionDto.file_url ?? prescription.file_url,
      is_custom: updatePrescriptionDto.is_custom ?? prescription.is_custom,
      notes: updatePrescriptionDto.notes ?? prescription.notes,
    };

    await this.prescriptionRepository.save(updatedPrescription);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const prescription = await this.findOne(id);
    await this.prescriptionRepository.remove(prescription);
  }

  async findAllByClient(clientId: number): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      where: { client_id: clientId },
      relations: ['client'],
      order: {
        issue_date: 'DESC',
      },
    });
  }

  async verifyPrescription(
    id: number,
    pharmacistId: number,
    status: PrescriptionStatus,
  ): Promise<Prescription> {
    const prescription = await this.findOne(id);

    prescription.status = status;
    prescription.verified_by = pharmacistId;
    prescription.verification_date = new Date();

    return this.prescriptionRepository.save(prescription);
  }
}
