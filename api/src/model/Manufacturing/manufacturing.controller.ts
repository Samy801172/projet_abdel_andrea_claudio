import { Controller, Get, Post, Put, Param, Body, UseGuards, UploadedFile, UseInterceptors, NotFoundException, Logger, InternalServerErrorException, Req, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtGuard } from '@feature/security/guard/jwt.guard';
import { AdminGuard } from '@feature/security/guard/admin.guard';
import { ManufacturingService } from './manufacturing.service';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Express } from 'express';
import { ManufacturingStatus } from './enums/manufacturing-status.enum';
import { Manufacturing } from './manufacturing.entity';
import { Request } from 'express';

// Définir l'interface pour notre user
interface RequestWithUser extends Request {
  user: {
    clientId: number;
    isAdmin: boolean;
    sub: string;
  }
}

@ApiTags('Manufacturing')
@Controller('manufacturing')
@UseGuards(JwtGuard)
export class ManufacturingController {
  private readonly logger = new Logger(ManufacturingController.name);
  
  constructor(private readonly manufacturingService: ManufacturingService) {}

  @Get('orders/:orderId/status')
  @ApiOperation({ summary: 'Récupérer le statut de fabrication d\'une commande' })
  @ApiParam({ name: 'orderId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Statut de fabrication récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Commande non trouvée' })
  async getOrderStatus(@Param('orderId') orderId: string) {
    this.logger.debug(`Tentative d'accès au statut de fabrication - OrderID: ${orderId}`);
    
    try {
      // Vérifier si la commande existe et nécessite une fabrication
      const order = await this.manufacturingService.getOrder(parseInt(orderId));
      if (!order) {
        throw new NotFoundException(`Commande ${orderId} non trouvée`);
      }

      let status = await this.manufacturingService.getOrderStatus(parseInt(orderId));
      
      if (!status) {
        this.logger.debug(`Création d'un statut initial pour la commande ${orderId}`);
        status = await this.manufacturingService.createInitialStatus(parseInt(orderId));
        this.logger.debug('Statut initial créé:', status);
      }

      this.logger.debug(`Statut récupéré:`, status);
      return status;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du statut - OrderID: ${orderId}`, error);
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Post('orders/:orderId/start')
  async startManufacturing(@Param('orderId') orderId: number) {
    return this.manufacturingService.startManufacturing(orderId);
  }

  @UseGuards(AdminGuard)
  @Put('orders/:orderId/status')
  async updateStatus(
    @Param('orderId') manufacturingId: number,
    @Body() updateDto: { status: ManufacturingStatus }
  ) {
    this.logger.debug(`Mise à jour du statut pour la fabrication ${manufacturingId} vers ${updateDto.status}`);
    
    try {
      // Vérifier que le statut est valide
      if (!Object.values(ManufacturingStatus).includes(updateDto.status)) {
        throw new BadRequestException(`Statut invalide: ${updateDto.status}`);
      }

      const result = await this.manufacturingService.updateStatus(manufacturingId, updateDto.status);
      this.logger.debug('Statut mis à jour avec succès:', result);
      return result;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du statut: ${error.message}`);
      throw error;
    }
  }

  @Post('request')
  @UseInterceptors(FileInterceptor('prescription', {
    storage: diskStorage({
      destination: './uploads/prescriptions',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extname(file.originalname));
      }
    })
  }))
  @ApiOperation({ summary: 'Créer une nouvelle demande de fabrication' })
  @ApiResponse({ status: 201, description: 'Demande créée avec succès' })
  async createRequest(
    @Body() data: { 
      type: string; 
      description: string; 
      instructions: string;
      totalPrice: string;
      deposit: string;
      status: ManufacturingStatus;
      clientId: string;
    },
    @UploadedFile() prescriptionFile?: Express.Multer.File,
    @Req() req?: RequestWithUser
  ) {
    this.logger.debug('Données reçues:', data);
    this.logger.debug('Fichier reçu:', prescriptionFile);

    return this.manufacturingService.createCustomRequest({
      ...data,
      clientId: Number(data.clientId) || req.user.clientId,
      prescriptionFile,
      totalPrice: Number(data.totalPrice)
    });
  }

  @Get('orders/client')
  @ApiOperation({ summary: 'Récupérer les commandes en fabrication du client' })
  @ApiResponse({ status: 200, description: 'Liste des commandes récupérée avec succès' })
  async getClientOrders(@Req() req: RequestWithUser) {
    this.logger.debug(`Récupération des commandes pour le client ${req.user.clientId}`);
    
    try {
      const orders = await this.manufacturingService.getClientOrders(req.user.clientId);
      this.logger.debug(`${orders.length} commandes trouvées`);
      return orders;
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des commandes:', error);
      throw error;
    }
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Récupérer les détails d\'une commande de fabrication' })
  @ApiParam({ name: 'orderId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Détails de la commande récupérés avec succès' })
  @ApiResponse({ status: 404, description: 'Commande non trouvée' })
  async getManufacturingOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    this.logger.debug(`Récupération des détails de la commande ${orderId}`);
    
    try {
      const order = await this.manufacturingService.getOrder(orderId);
      return {
        ...order,
        statusText: this.getStatusText(order.status),
        statusClass: this.getStatusClass(order.status)
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de la commande ${orderId}:`, error);
      throw error;
    }
  }

  @Post()
  async createManufacturing(@Body() data: any, @Req() req: RequestWithUser): Promise<Manufacturing> {
    this.logger.debug(`Création d'une nouvelle fabrication pour le client ${req.user.clientId}`);
    
    return this.manufacturingService.create({
      ...data,
      clientId: req.user.clientId
    });
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all manufacturing orders' })
  @ApiResponse({
    status: 200,
    description: 'Liste des fabrications récupérée avec succès'
  })
  async getManufacturings(): Promise<any[]> {
    try {
      const manufacturings = await this.manufacturingService.getManufacturings();
      
      // Formater les données pour l'affichage
      return manufacturings.map(m => ({
        id: m.id,
        clientId: m.clientId,
        type: m.type,
        description: m.description,
        status: m.status,
        statusText: this.getStatusText(m.status),
        statusClass: this.getStatusClass(m.status),
        estimatedPrice: m.estimatedPrice,
        deposit: m.estimatedPrice * 0.3,
        createdAt: m.createdAt,
        instructions: m.instructions,
        prescriptionPath: m.prescriptionPath
      }));
    } catch (error) {
      this.logger.error('Error fetching manufacturings:', error);
      throw new InternalServerErrorException('Error fetching manufacturings');
    }
  }

  @Get('details/:id')
  @ApiOperation({ summary: 'Get manufacturing details' })
  async getManufacturingDetails(@Param('id') id: number): Promise<any> {
    try {
      const manufacturing = await this.manufacturingService.findOne(id);
      return {
        id: manufacturing.id,
        type: manufacturing.type,
        description: manufacturing.description,
        status: manufacturing.status,
        statusText: this.getStatusText(manufacturing.status),
        statusClass: this.getStatusClass(manufacturing.status),
        estimatedPrice: manufacturing.estimatedPrice,
        deposit: manufacturing.estimatedPrice * 0.3,
        createdAt: manufacturing.createdAt,
        instructions: manufacturing.instructions,
        prescriptionPath: manufacturing.prescriptionPath
      };
    } catch (error) {
      this.logger.error(`Error fetching manufacturing details for id ${id}:`, error);
      throw new NotFoundException(`Manufacturing with id ${id} not found`);
    }
  }

  @Get('admin/orders')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all manufacturing orders (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des fabrications récupérée avec succès'
  })
  async getAdminManufacturings(): Promise<any[]> {
    try {
      const manufacturings = await this.manufacturingService.getAdminManufacturings();
      return manufacturings.map(m => ({
        id: m.id,
        clientId: m.clientId,
        type: m.type,
        description: m.description,
        status: m.status,
        statusText: this.getStatusText(m.status),
        statusClass: this.getStatusClass(m.status),
        estimatedPrice: m.estimatedPrice,
        deposit: m.estimatedPrice * 0.3,
        createdAt: m.createdAt,
        instructions: m.instructions,
        prescriptionPath: m.prescriptionPath
      }));
    } catch (error) {
      this.logger.error('Error fetching admin manufacturings:', error);
      throw new InternalServerErrorException('Error fetching manufacturings');
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
      [ManufacturingStatus.EN_ATTENTE_ACOMPTE]: 'badge-warning',
      [ManufacturingStatus.ACOMPTE_PAYE]: 'badge-info',
      [ManufacturingStatus.EN_FABRICATION]: 'badge-primary',
      [ManufacturingStatus.PRET]: 'badge-success',
      [ManufacturingStatus.TERMINE]: 'badge-success'
    };
    return statusClassMap[status] || 'badge-secondary';
  }
} 