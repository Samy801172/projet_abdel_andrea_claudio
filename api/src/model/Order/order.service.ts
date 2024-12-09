import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order-.dto';
import { OrderDetail } from './OrderDetail/order-detail.entity';
import { Cart } from '../Cart/cart.entity';
import { Product } from '../Product/product.entity';
  import { Client} from '../Client/client.entity';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Client)  // Ajout du ClientRepository
    private readonly clientRepository: Repository<Client>,
    private readonly dataSource: DataSource
  ) {}
// Modifier aussi la méthode getOrderById pour inclure le client
  async getOrderById(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id_order: id },
      relations: [
        'client',
        'orderDetails',
        'orderDetails.product'
      ]
    });

    if (!order) {
      throw new NotFoundException(`Commande ${id} non trouvée`);
    }

    return order;
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Vérifier l'existence du client
      const client = await this.clientRepository.findOne({
        where: { clientId: createOrderDto.id_client }
      });

      if (!client) {
        throw new NotFoundException(`Client ${createOrderDto.id_client} non trouvé`);
      }

      // 2. Créer la commande
      const order = this.orderRepository.create({
        id_client: createOrderDto.id_client,
        id_statut: createOrderDto.id_statut,
        date_order: createOrderDto.date_order || new Date(),
        montant_total: 0
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // 3. Traiter les lignes de commande
      const orderDetails = [];
      let totalAmount = 0;

      for (const line of createOrderDto.orderLines) {
        const product = await this.productRepository.findOne({
          where: { id_product: line.id_product }
        });

        if (!product) {
          throw new NotFoundException(`Produit ${line.id_product} non trouvé`);
        }

        if (product.stock < line.quantity) {
          throw new BadRequestException(
            `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}`
          );
        }

        // Créer le détail de commande
        const detail = this.orderDetailRepository.create({
          order: savedOrder,
          product,
          quantity: line.quantity,
          unit_price: product.price
        });

        // Mettre à jour le stock
        product.stock -= line.quantity;
        await queryRunner.manager.save(Product, product);

        orderDetails.push(detail);
        totalAmount += line.quantity * parseFloat(product.price.toString());
      }

      // 4. Sauvegarder les détails
      await queryRunner.manager.save(OrderDetail, orderDetails);

      // 5. Mettre à jour le montant total
      savedOrder.montant_total = totalAmount;
      await queryRunner.manager.save(Order, savedOrder);

      // 6. Vider le panier
      await queryRunner.manager.delete(Cart, { clientId: createOrderDto.id_client });

      await queryRunner.commitTransaction();
      return this.getOrderById(savedOrder.id_order);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async updateOrder(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.getOrderById(id);

      Object.assign(order, {
        date_order: updateOrderDto.date_order || order.date_order,
        id_statut: updateOrderDto.id_statut || order.id_statut
      });

      if (updateOrderDto.orderLines?.length) {
        // Restaurer les stocks
        for (const detail of order.orderDetails) {
          const product = await this.productRepository.findOne({
            where: { id_product: detail.product.id_product }
          });
          if (product) {
            product.stock += detail.quantity;
            await queryRunner.manager.save(Product, product);
          }
        }

        // Supprimer les anciennes lignes
        await queryRunner.manager.delete(OrderDetail, { order: { id_order: id } });

        // Créer les nouvelles lignes
        const newDetails = await Promise.all(
          updateOrderDto.orderLines.map(async (line) => {
            const product = await this.productRepository.findOne({
              where: { id_product: line.id_product }
            });

            if (!product) {
              throw new NotFoundException(`Produit ${line.id_product} non trouvé`);
            }

            if (product.stock < line.quantity) {
              throw new BadRequestException(
                `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}`
              );
            }

            product.stock -= line.quantity;
            await queryRunner.manager.save(Product, product);

            return this.orderDetailRepository.create({
              order,
              product,
              quantity: line.quantity,
              unit_price: line.unit_price || product.price
            });
          })
        );

        await queryRunner.manager.save(OrderDetail, newDetails);

        order.montant_total = newDetails.reduce(
          (sum, detail) => sum + (detail.quantity * detail.unit_price),
          0
        );
      }

      const updatedOrder = await queryRunner.manager.save(Order, order);
      await queryRunner.commitTransaction();
      return this.getOrderById(updatedOrder.id_order);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteOrder(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.getOrderById(id);

      // Restaurer les stocks
      for (const detail of order.orderDetails) {
        const product = await this.productRepository.findOne({
          where: { id_product: detail.product.id_product }
        });
        if (product) {
          product.stock += detail.quantity;
          await queryRunner.manager.save(Product, product);
        }
      }

      await queryRunner.manager.delete(OrderDetail, { order: { id_order: id } });
      await queryRunner.manager.remove(Order, order);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllByClient(clientId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { id_client: clientId },
      relations: ['orderDetails', 'orderDetails.product', 'status'],
      order: { date_order: 'DESC' }
    });
  }
// Ajouter la validation des transitions de statut
  async updateOrderStatus(orderId: number, statusId: number): Promise<Order> {
    const order = await this.getOrderById(orderId);

    // Vérifier si la transition est valide
    const validTransitions = {
      1: [2, 5],  // Pending -> Processing ou Cancelled
      2: [3, 5],  // Processing -> Shipped ou Cancelled
      3: [4, 5],  // Shipped -> Delivered ou Cancelled
      4: [],      // Delivered -> Aucune transition
      5: []       // Cancelled -> Aucune transition
    };

    if (!validTransitions[order.id_statut]?.includes(statusId)) {
      throw new BadRequestException('Cette transition de statut n\'est pas autorisée');
    }

    order.id_statut = statusId;
    return await this.orderRepository.save(order);
  }
  async validatePayment(orderId: number, clientId: number, paymentInfo: any): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.getOrderById(orderId);

      if (order.id_client !== clientId) {
        throw new BadRequestException('Cette commande ne vous appartient pas');
      }

      if (order.id_statut !== 1) {
        throw new BadRequestException('Cette commande ne peut pas être payée');
      }

      order.id_statut = 2; // Statut "payée"
      const updatedOrder = await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();
      return updatedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async createOrderFromCart(clientId: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Récupérer les éléments du panier
      const cartItems = await this.cartRepository.find({
        where: { clientId },
        relations: ['product']
      });

      if (!cartItems.length) {
        throw new BadRequestException('Le panier est vide');
      }

      // 2. Vérifier les stocks
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuffisant pour ${item.product.name}. Disponible: ${item.product.stock}`
          );
        }
      }

      // 3. Créer la commande
      const order = this.orderRepository.create({
        id_client: clientId,
        id_statut: 1, // Statut initial (en attente de paiement)
        date_order: new Date(),
        montant_total: 0
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // 4. Créer les détails de commande
      const orderDetails = await Promise.all(
        cartItems.map(async (item) => {
          // Créer le détail de commande
          const detail = this.orderDetailRepository.create({
            order: savedOrder,
            product: item.product,
            quantity: item.quantity,
            unit_price: item.product.price
          });

          // Mettre à jour le stock
          item.product.stock -= item.quantity;
          await queryRunner.manager.save(Product, item.product);

          return detail;
        })
      );

      await queryRunner.manager.save(OrderDetail, orderDetails);

      // 5. Calculer le montant total
      savedOrder.montant_total = orderDetails.reduce(
        (sum, detail) => sum + (detail.quantity * detail.unit_price),
        0
      );
      await queryRunner.manager.save(Order, savedOrder);

      // 6. Vider le panier
      await queryRunner.manager.delete(Cart, { clientId });

      // 7. Valider la transaction
      await queryRunner.commitTransaction();

      this.logger.log(`Commande créée avec succès pour le client ${clientId}`);
      return this.getOrderById(savedOrder.id_order);

    } catch (error) {
      this.logger.error(`Erreur lors de la création de la commande depuis le panier: ${error.message}`);
      await queryRunner.rollbackTransaction();
      throw error;

    } finally {
      await queryRunner.release();
    }
  }
  async findAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: [
        'orderDetails',
        'orderDetails.product',
        'status',
        'client'  // Pour avoir les informations du client
      ],
      order: {
        date_order: 'DESC'  // Les plus récentes en premier
      }
    });
  }
  // Nouvelle méthode pour récupérer toutes les commandes
  async findAll(): Promise<Order[]> {
    // Remplacer la méthode existante par celle-ci
    return this.orderRepository.find({
      relations: [
        'client',
        'orderDetails',
        'orderDetails.product'
      ],
      order: {
        date_order: 'DESC'
      }
    });
  }
}