import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manufacturing } from './manufacturing.entity';
import { ManufacturingStatus } from './manufacturing-status.enum';
import { Logger } from '@nestjs/common';

@Injectable()
export class ManufacturingService {
  private readonly logger = new Logger(ManufacturingService.name);

  constructor(
    @InjectRepository(Manufacturing)
    private manufacturingRepository: Repository<Manufacturing>,
  ) {}

  async updateStatus(orderId: number, status: ManufacturingStatus): Promise<Manufacturing> {
    const manufacturing = await this.manufacturingRepository.findOne({
      where: { orderId }
    });

    if (!manufacturing) {
      throw new NotFoundException(`Manufacturing with orderId ${orderId} not found`);
    }

    manufacturing.status = status;
    manufacturing.updatedAt = new Date();
    
    // Log for debugging
    console.log('Updating status:', { orderId, oldStatus: manufacturing.status, newStatus: status });
    
    const updated = await this.manufacturingRepository.save(manufacturing);
    
    // Log to confirm the update
    console.log('Status updated:', updated);
    
    return updated;
  }

  async getClientOrders(clientId: number): Promise<Manufacturing[]> {
    try {
      // S'assurer que clientId est un nombre
      const parsedClientId = parseInt(clientId.toString(), 10);
      
      if (isNaN(parsedClientId)) {
        throw new BadRequestException('Client ID invalide');
      }

      const fabrications = await this.manufacturingRepository
        .createQueryBuilder('manufacturing')
        .where('manufacturing.clientId = :clientId', { clientId: parsedClientId })
        .orderBy('manufacturing.createdAt', 'DESC')
        .getMany();

      this.logger.debug(`Found ${fabrications.length} fabrications for client ${clientId}`);
      return fabrications;
    } catch (error) {
      this.logger.error('Error fetching client orders:', error);
      throw new InternalServerErrorException('Erreur lors de la récupération des fabrications');
    }
  }

  async getOrder(orderId: number): Promise<Manufacturing> {
    try {
      // S'assurer que orderId est un nombre
      const parsedOrderId = parseInt(orderId.toString(), 10);
      
      if (isNaN(parsedOrderId)) {
        throw new BadRequestException('Order ID invalide');
      }

      const order = await this.manufacturingRepository.findOne({
        where: { id: parsedOrderId }
      });

      if (!order) {
        throw new NotFoundException(`Fabrication ${orderId} non trouvée`);
      }

      return order;
    } catch (error) {
      this.logger.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  }
}
