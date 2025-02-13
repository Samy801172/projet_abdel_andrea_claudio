import { Injectable, NotFoundException, Logger, InternalServerErrorException, HttpException, HttpStatus, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manufacturing } from './manufacturing.entity';
import { ManufacturingStatus } from './enums/manufacturing-status.enum';
import { Order } from '../Order/order.entity';
import { ManufacturingCustomRequest } from './manufacturing-custom-request.entity';
import { Express } from 'express';
import { StockService } from '../Stock/stock.service';
import { NotificationService } from '../Notification/notification.service';

@Injectable()
export class ManufacturingService {
  private readonly logger = new Logger(ManufacturingService.name);

  constructor(
    @InjectRepository(Manufacturing)
    private readonly manufacturingRepository: Repository<Manufacturing>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(ManufacturingCustomRequest)
    private customRequestRepository: Repository<ManufacturingCustomRequest>,
    private stockService: StockService,
    private notificationService: NotificationService
  ) {}

  async startManufacturing(orderId: number) {
    const manufacturingStatus = this.manufacturingRepository.create({
      orderId,
      status: ManufacturingStatus.EN_FABRICATION,
      estimatedCompletionDate: this.calculateEstimatedCompletion()
    });

    return this.manufacturingRepository.save(manufacturingStatus);
  }

  private calculateEstimatedCompletion(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 3); // 3 jours par défaut
    return date;
  }

  async getManufacturingStatus(orderId: number) {
    return this.manufacturingRepository.findOne({
      where: { orderId },
      relations: ['order']
    });
  }

  async createCustomRequest(data: {
    type: string;
    description: string;
    instructions: string;
    prescriptionFile?: Express.Multer.File;
    clientId: number;
    totalPrice?: number;
    status?: ManufacturingStatus;
  }) {
    try {
      this.logger.debug('Création d\'une nouvelle demande de fabrication:', data);

      const customRequest = new ManufacturingCustomRequest();
      customRequest.type = data.type;
      customRequest.description = data.description;
      customRequest.instructions = data.instructions;
      customRequest.clientId = data.clientId;
      customRequest.estimatedPrice = Number(data.totalPrice) || 0;
      customRequest.status = data.status || ManufacturingStatus.EN_ATTENTE_ACOMPTE;
      
      if (data.prescriptionFile) {
        customRequest.prescriptionPath = data.prescriptionFile.filename;
      }

      const savedRequest = await this.customRequestRepository.save(customRequest);
      this.logger.debug('Demande de fabrication créée:', savedRequest);
      
      return savedRequest;
    } catch (error) {
      this.logger.error('Erreur lors de la création de la demande:', error);
      throw new InternalServerErrorException('Erreur lors de la création de la demande de fabrication');
    }
  }

  async getOrderStatus(orderId: number) {
    this.logger.debug(`Recherche du statut pour la commande ${orderId}`);
    const status = await this.manufacturingRepository.findOne({
      where: { orderId },
      relations: ['order']
    });
    this.logger.debug('Statut trouvé:', status);
    return status;
  }

  async createInitialStatus(orderId: number): Promise<Manufacturing> {
    const initialStatus = this.manufacturingRepository.create({
      orderId,
      status: ManufacturingStatus.EN_ATTENTE_ACOMPTE,
      estimatedCompletionDate: this.calculateEstimatedCompletion()
    });

    return this.manufacturingRepository.save(initialStatus);
  }

  async getOrder(orderId: number): Promise<any> {
    this.logger.debug(`Recherche de la fabrication ${orderId}`);

    // Vérifier que orderId est un nombre valide
    if (!orderId || isNaN(orderId)) {
      throw new BadRequestException('ID de commande invalide');
    }

    try {
      // Chercher d'abord dans manufacturing
      const manufacturing = await this.manufacturingRepository.findOne({
        where: { id: orderId }
      });

      if (manufacturing) {
        return {
          ...manufacturing,
          deposit: (manufacturing.estimatedPrice || 0) * 0.3,
          totalPrice: manufacturing.estimatedPrice || 0
        };
      }

      // Si non trouvé, chercher dans custom requests
      const customRequest = await this.customRequestRepository.findOne({
        where: { id: orderId }
      });

      if (customRequest) {
        return {
          ...customRequest,
          deposit: (customRequest.estimatedPrice || 0) * 0.3,
          totalPrice: customRequest.estimatedPrice || 0
        };
      }

      // Si rien trouvé, lancer une erreur
      throw new NotFoundException(`Commande ${orderId} non trouvée`);

    } catch (error) {
      this.logger.error(`Erreur lors de la recherche de la fabrication ${orderId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la récupération de la fabrication');
    }
  }

  private calculateBasePrice(type: string): number {
    switch (type.toLowerCase()) {
      case 'capsules':
        return 50;
      case 'sirop':
        return 35;
      case 'pommade':
        return 45;
      case 'crème':
        return 40;
      default:
        return 40;
    }
  }

  private calculateComplexity(order: ManufacturingCustomRequest): number {
    let complexity = 1;
    
    // Augmente la complexité selon les instructions
    if (order.instructions && order.instructions.length > 100) {
      complexity += 0.2;
    }

    // Augmente selon la description
    if (order.description && order.description.length > 200) {
      complexity += 0.1;
    }

    return complexity;
  }

  async getClientOrders(clientId: number): Promise<any[]> {
    this.logger.debug(`Recherche des fabrications pour le client ${clientId}`);
    
    try {
      // Récupérer les fabrications normales
      const fabrications = await this.manufacturingRepository
        .createQueryBuilder('manufacturing')
        .where('manufacturing.clientId = :clientId', { clientId })
        .orderBy('manufacturing.createdAt', 'DESC')
        .getMany();

      // Formater les résultats
      const formattedFabrications = fabrications.map(fab => ({
        id: fab.id,
        type: fab.type,
        description: fab.description,
        status: fab.status,
        statusText: this.getStatusText(fab.status),
        statusClass: this.getStatusClass(fab.status),
        estimatedPrice: fab.estimatedPrice || 0,
        deposit: (fab.estimatedPrice || 0) * 0.3,
        totalPrice: fab.estimatedPrice || 0,
        instructions: fab.instructions,
        prescriptionPath: fab.prescriptionPath,
        createdAt: fab.createdAt
      }));

      this.logger.debug(`Trouvé ${formattedFabrications.length} fabrications pour le client ${clientId}`);
      return formattedFabrications;

    } catch (error) {
      this.logger.error('Erreur récupération fabrications:', error.message);
      throw new InternalServerErrorException('Erreur lors de la récupération des fabrications');
    }
  }

  private getStatusText(status: ManufacturingStatus): string {
    const statusMap = {
      [ManufacturingStatus.EN_ATTENTE_ACOMPTE]: 'En attente d\'acompte',
      [ManufacturingStatus.ACOMPTE_PAYE]: 'Acompte payé',
      [ManufacturingStatus.EN_FABRICATION]: 'En fabrication',
      [ManufacturingStatus.PRET]: 'Prêt',
      [ManufacturingStatus.TERMINE]: 'Terminé'
    };
    return statusMap[status] || 'Inconnu';
  }

  private getStatusClass(status: ManufacturingStatus): string {
    const statusClassMap = {
      [ManufacturingStatus.EN_ATTENTE_ACOMPTE]: 'status-pending',
      [ManufacturingStatus.ACOMPTE_PAYE]: 'status-deposit',
      [ManufacturingStatus.EN_FABRICATION]: 'status-progress',
      [ManufacturingStatus.PRET]: 'status-ready',
      [ManufacturingStatus.TERMINE]: 'status-completed'
    };
    return statusClassMap[status] || 'status-unknown';
  }

  async create(data: {
    clientId: number;
    type: string;
    description: string;
    status: ManufacturingStatus;
    estimatedPrice: string | number;
    instructions: string;
    prescriptionPath?: string;
  }): Promise<Manufacturing> {
    try {
      this.logger.debug('Création d\'une nouvelle fabrication avec les données:', data);

      const manufacturing = this.manufacturingRepository.create({
        clientId: data.clientId,
        type: data.type,
        description: data.description,
        status: data.status,
        estimatedPrice: Number(data.estimatedPrice), // Conversion en nombre
        instructions: data.instructions,
        prescriptionPath: data.prescriptionPath,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedManufacturing = await this.manufacturingRepository.save(manufacturing);
      this.logger.debug('Fabrication créée avec succès:', savedManufacturing);
      
      return savedManufacturing;
    } catch (error) {
      this.logger.error('Erreur lors de la création de la fabrication:', error);
      throw new HttpException(
        'Erreur lors de la création de la fabrication: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(): Promise<Manufacturing[]> {
    return this.manufacturingRepository.find();
  }

  async findOne(id: number): Promise<Manufacturing> {
    const manufacturing = await this.manufacturingRepository.findOne({
      where: { id }
    });
    if (!manufacturing) {
      throw new NotFoundException(`Fabrication avec l'ID ${id} non trouvée`);
    }
    return manufacturing;
  }

  async updateStatus(orderId: number, status: ManufacturingStatus): Promise<Manufacturing> {
    this.logger.debug(`Mise à jour du statut pour la fabrication ${orderId} vers ${status}`);
    
    const manufacturing = await this.manufacturingRepository.findOne({
      where: { id: orderId }
    });

    if (!manufacturing) {
      throw new NotFoundException(`Fabrication avec l'ID ${orderId} non trouvée`);
    }

    // Vérifier que le nouveau statut est valide
    if (!Object.values(ManufacturingStatus).includes(status)) {
      throw new BadRequestException(`Statut invalide: ${status}`);
    }

    manufacturing.status = status;
    manufacturing.updatedAt = new Date();
    
    this.logger.debug('Mise à jour du statut:', { 
      id: orderId, 
      ancienStatut: manufacturing.status, 
      nouveauStatut: status 
    });
    
    const updated = await this.manufacturingRepository.save(manufacturing);
    
    this.logger.debug('Statut mis à jour:', updated);
    
    return updated;
  }

  async getManufacturings(): Promise<Manufacturing[]> {
    try {
      const manufacturings = await this.manufacturingRepository
        .createQueryBuilder('manufacturing')
        .leftJoinAndSelect('manufacturing.order', 'order')
        .select([
          'manufacturing.id',
          'manufacturing.clientId',
          'manufacturing.orderId',
          'manufacturing.status',
          'manufacturing.type',
          'manufacturing.description',
          'manufacturing.instructions',
          'manufacturing.estimatedPrice',
          'manufacturing.prescriptionPath',
          'manufacturing.createdAt',
          'manufacturing.updatedAt',
          'order.id_order',
          'order.montant_total'
        ])
        .orderBy('manufacturing.createdAt', 'DESC')
        .getMany();

      // Transformer le statut en texte lisible
      const formattedManufacturings = manufacturings.map(m => ({
        ...m,
        statusText: this.getStatusText(m.status),
        statusClass: this.getStatusClass(m.status)
      }));

      this.logger.debug(`Found ${manufacturings.length} manufacturings`);
      return formattedManufacturings;
    } catch (error) {
      this.logger.error('Error fetching manufacturings:', error);
      throw new InternalServerErrorException('Error fetching manufacturings');
    }
  }

  async getAdminManufacturings(): Promise<any[]> {
    try {
      const manufacturings = await this.manufacturingRepository
        .createQueryBuilder('manufacturing')
        .select([
          'manufacturing.id',
          'manufacturing.clientId',
          'manufacturing.type',
          'manufacturing.description',
          'manufacturing.status',
          'manufacturing.instructions',
          'manufacturing.estimatedPrice',
          'manufacturing.prescriptionPath',
          'manufacturing.createdAt',
          'manufacturing.updatedAt'
        ])
        .orderBy('manufacturing.createdAt', 'DESC')
        .getMany();

      // Transformer les résultats
      const formattedManufacturings = manufacturings.map(m => ({
        id: m.id,
        clientId: m.clientId,
        type: m.type,
        description: m.description,
        status: m.status,
        statusText: this.getStatusText(m.status),
        statusClass: this.getStatusClass(m.status),
        estimatedPrice: m.estimatedPrice || 0,
        deposit: (m.estimatedPrice || 0) * 0.3,
        createdAt: m.createdAt,
        instructions: m.instructions,
        prescriptionPath: m.prescriptionPath
      }));

      this.logger.debug(`Trouvé ${manufacturings.length} fabrications pour l'admin`);
      return formattedManufacturings;
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des fabrications admin:', error.message);
      throw new InternalServerErrorException('Erreur lors de la récupération des fabrications');
    }
  }

  calculateDepositAmount(totalPrice: number): number {
    return totalPrice * 0.3; // 30% du prix total
  }

  async updateManufacturingStatus(id: number, status: ManufacturingStatus) {
    const manufacturing = await this.manufacturingRepository.findOne({
      where: { id }
    });

    if (!manufacturing) {
      throw new NotFoundException(`Manufacturing ${id} not found`);
    }

    // Si le statut passe à PRET, mettre à jour le stock
    if (status === ManufacturingStatus.PRET) {
      // Utiliser une quantité par défaut de 1 si non spécifiée
      const quantityToUpdate = 1;
      await this.stockService.updateStockForManufacturing(id, quantityToUpdate);
      
      // Notifier le client
      await this.notificationService.notifyClient(
        manufacturing.clientId,
        'Votre médicament est prêt à être retiré'
      );
    }

    manufacturing.status = status;
    return this.manufacturingRepository.save(manufacturing);
  }

  async validateClientAccess(manufacturingId: number, clientId: number): Promise<boolean> {
    const manufacturing = await this.manufacturingRepository.findOne({
      where: { 
        id: manufacturingId,
        clientId: clientId
      }
    });

    if (!manufacturing) {
      throw new UnauthorizedException('Vous n\'avez pas accès à cette fabrication');
    }

    return true;
  }

  async processDeposit(manufacturingId: number, paymentData: any) {
    const manufacturing = await this.manufacturingRepository.findOne({
      where: { id: manufacturingId }
    });

    if (!manufacturing) {
      throw new NotFoundException('Fabrication non trouvée');
    }

    // Vérifier que c'est bien le bon client
    if (manufacturing.clientId !== paymentData.clientId) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à payer cet acompte');
    }

    // Calculer l'acompte (30%)
    const depositAmount = this.calculateDepositAmount(manufacturing.estimatedPrice);

    // Vérifier que le montant payé correspond
    if (paymentData.amount !== depositAmount) {
      throw new BadRequestException('Le montant de l\'acompte est incorrect');
    }

    // Mettre à jour le statut
    manufacturing.status = ManufacturingStatus.ACOMPTE_PAYE;
    await this.manufacturingRepository.save(manufacturing);

    return manufacturing;
  }

  async validatePickup(manufacturingId: number, clientId: number) {
    const manufacturing = await this.manufacturingRepository.findOne({
      where: { id: manufacturingId }
    });

    if (!manufacturing) {
      throw new NotFoundException('Fabrication non trouvée');
    }

    // Vérifier que c'est le bon client
    if (manufacturing.clientId !== clientId) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à récupérer ce médicament');
    }

    // Vérifier que le médicament est prêt
    if (manufacturing.status !== ManufacturingStatus.PRET) {
      throw new BadRequestException('Le médicament n\'est pas encore prêt');
    }

    // Mettre à jour le statut
    manufacturing.status = ManufacturingStatus.TERMINE;
    return this.manufacturingRepository.save(manufacturing);
  }
} 