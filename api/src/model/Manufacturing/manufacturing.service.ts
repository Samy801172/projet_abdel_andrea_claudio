import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manufacturing } from './manufacturing.entity';
import { Order } from '../Order/order.entity';
import { OrderStatus } from '../OrderStatus/dto/order-status.enum';
import { OrderStatusEntity } from '../OrderStatus/orderStatus.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ManufacturingService {
    constructor(
        @InjectRepository(Manufacturing)
        private manufacturingRepository: Repository<Manufacturing>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderStatusEntity)
        private orderStatusRepository: Repository<OrderStatusEntity>
    ) {}

    async createManufacturingOrder(orderId: number, depositAmount: number, totalAmount: number) {
        const order = await this.orderRepository.findOneOrFail({ 
            where: { id_order: orderId }
        });
        
        const depositPendingStatus = await this.orderStatusRepository.findOneOrFail({
            where: { statusId: 1 }
        });

        const manufacturing = new Manufacturing();
        manufacturing.order = order;
        manufacturing.startDate = new Date();
        manufacturing.depositAmount = depositAmount;
        manufacturing.totalAmount = totalAmount;
        manufacturing.depositPaid = false;
        manufacturing.status = OrderStatus.DEPOSIT_PENDING;

        await this.orderRepository.update(orderId, { 
            id_statut: depositPendingStatus.statusId
        });
        
        return this.manufacturingRepository.save(manufacturing);
    }

    async processDepositPayment(manufacturingId: number, paymentDetails: any) {
        const manufacturing = await this.manufacturingRepository.findOneOrFail({ 
            where: { id: manufacturingId },
            relations: ['order']
        });

        if (manufacturing.depositPaid) {
            throw new Error('L\'acompte a déjà été payé');
        }

        try {
            const manufacturingStatus = await this.orderStatusRepository.findOneOrFail({
                where: { statusId: 2 }
            });

            manufacturing.depositPaid = true;
            manufacturing.status = OrderStatus.MANUFACTURING;
            
            await this.orderRepository.update(manufacturing.order.id_order, { 
                id_statut: manufacturingStatus.statusId
            });
            
            return this.manufacturingRepository.save(manufacturing);
        } catch (error) {
            throw new Error('Échec du paiement de l\'acompte: ' + error.message);
        }
    }

    async updateManufacturingStatus(manufacturingId: number, status: OrderStatus) {
        const manufacturing = await this.manufacturingRepository.findOneOrFail({ 
            where: { id: manufacturingId },
            relations: ['order']
        });
        
        if (![OrderStatus.MANUFACTURING, OrderStatus.READY].includes(status)) {
            throw new Error('Statut invalide pour la fabrication');
        }
        
        manufacturing.status = status;
        
        if (status === OrderStatus.READY) {
            const readyStatus = await this.orderStatusRepository.findOneOrFail({
                where: { statusId: 3 }
            });

            manufacturing.completionDate = new Date();
            await this.orderRepository.update(manufacturing.order.id_order, { 
                id_statut: readyStatus.statusId
            });
        }
        
        return this.manufacturingRepository.save(manufacturing);
    }

    async createCustomManufacturing(prescription: Express.Multer.File, notes: string) {
        if (!prescription) {
            throw new BadRequestException('L\'ordonnance est requise');
        }

        const prescriptionUrl = await this.saveFile(prescription);

        const manufacturing = this.manufacturingRepository.create({
            prescriptionUrl,
            notes,
            startDate: new Date(),
            depositAmount: 50, // Montant fixe ou calculé selon vos besoins
            totalAmount: 100, // À calculer selon vos besoins
            depositPaid: false,
            status: OrderStatus.DEPOSIT_PENDING
        });

        return this.manufacturingRepository.save(manufacturing);
    }

    private async saveFile(file: Express.Multer.File): Promise<string> {
        const uploadDir = 'uploads/prescriptions';
        
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uniqueFileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, uniqueFileName);

        // Écrire le fichier
        fs.writeFileSync(filePath, file.buffer);

        return filePath;
    }

    async getManufacturingDetails(id: number) {
        return this.manufacturingRepository.findOneOrFail({ 
            where: { id }
        });
    }

    async getAllManufacturing() {
        return this.manufacturingRepository.find({
            relations: ['order']
        });
    }

    async getManufacturingById(id: number) {
        return this.manufacturingRepository.findOne({
            where: { id },
            relations: ['order']
        });
    }
} 