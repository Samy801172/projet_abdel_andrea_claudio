// src/services/client.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { Order } from '../Order/order.entity';

export class ClientModule {}

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(client);
  }

  // pour récupérer les données des client
  async findAll(): Promise<Client[]> {
    console.log('Recherche de tous les clients...');

    const clients = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.credential', 'credential') // Assurez-vous que la relation est définie dans l'entité
      .select([
        'client.clientId',
        'client.firstName',
        'client.lastName',
        'client.address',
        'credential.isAdmin', // Inclure les données de Credential pour le status admin
        'credential.username', // Inclure les données de Credential
        'credential.mail', // Inclure les données de Credential
        'credential.active', // Inclure les donnée de Crédential pour le status
        'client.avatar',
      ])
      .getMany(); // Retourne tous les clients

    console.log('Clients trouvés:', clients);
    return clients;
  }

  // Récupérer commande d'un client
  async getClientOrders(clientId: number): Promise<Order[]> {
    const client = await this.clientRepository.findOne({
      where: { clientId },
      relations: ['orders'], // Assurez-vous que la relation est définie
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'ID ${clientId} non trouvé.`);
    }

    return client.orders; // Retourne les commandes liées au client
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { clientId: id },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  async remove(id: number): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }

  async findByCredentialId(credentialId: string): Promise<Client | null> {
    console.log('Recherche client pour credential:', credentialId);
    const client = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.credential', 'credential')
      .where('credential.credential_id = :credentialId', { credentialId })
      .getOne();

    console.log('Client trouvé:', client);
    return client;
  }

  async findProfileById(clientId: number): Promise<Client | null> {
    console.log('Recherche client pour clientId:', clientId);

    const client = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.credential', 'credential') // Assurez-vous que la relation est bien définie
      .select([
        'client.clientId',
        'client.firstName',
        'client.lastName',
        'client.address',
        'credential.username', // Inclure les données de Credential
        'credential.mail', // Inclure les données de Credential
        'client.avatar',
      ])
      .where('client.clientId = :clientId', { clientId })
      .getOne();

    console.log('Client trouvé:', client);
    return client;
  }

  async updateIsAdmin(id: number, updateProfileDto: UpdateProfileDto): Promise<Client> {
    try {
      // Récupérer le client avec la relation Credential
      const client = await this.clientRepository.findOne({
        where: { clientId: id },
        relations: ['credential'],
      });

      if (!client) {
        throw new NotFoundException(`Client avec l'ID ${id} non trouvé.`);
      }

      // Mettre à jour les champs liés à Credential
      if (updateProfileDto.isAdmin !== undefined) {
        client.credential.isAdmin = updateProfileDto.isAdmin;
      }
      if (updateProfileDto.active !== undefined) {
        client.credential.active = updateProfileDto.active;
      }

      // Mettre à jour les champs de Client
      Object.assign(client, updateProfileDto);

      // Sauvegarder les modifications
      const updatedClient = await this.clientRepository.save(client);
      console.log(`Mise à jour réussie pour le client ID: ${id}`);
      return updatedClient;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour pour le client ID: ${id}`, error);
      throw new InternalServerErrorException('Erreur lors de la mise à jour du client.');
    }
  }

  //Mise à jour de l'avatar
  async updateAvatar(clientId: number, avatarPath: string): Promise<Client | null> {
    const client = await this.clientRepository.findOne({ where: { clientId } });
    if (!client) {
      return null;
    }
    client.avatar = avatarPath; // Met à jour l'URL de l'avatar dans la base de données
    return this.clientRepository.save(client);
  }

  //Mise à jour du profile de l'utilisateur
  async updateProfile(clientId: number, updateClientDto: UpdateClientDto): Promise<Client> {
    // Récupérer le client à partir de l'ID
    const client = await this.clientRepository.findOne({
      where: { clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Mise à jour des champs autorisés uniquement
    if (updateClientDto.firstName) {
      client.firstName = updateClientDto.firstName;
    }

    if (updateClientDto.lastName) {
      client.lastName = updateClientDto.lastName;
    }

    if (updateClientDto.address) {
      client.address = updateClientDto.address;
    }

    // Sauvegarde des modifications
    return await this.clientRepository.save(client);
  }
}
