import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order-.dto';
import { OrderDetail } from './OrderDetail/order-detail.entity';
import { Cart } from '../Cart/cart.entity';
import { Product } from '../Product/product.entity';
import { Client } from '../Client/client.entity';

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
    @InjectRepository(Client) // Ajout du ClientRepository
    private readonly clientRepository: Repository<Client>,
    private readonly dataSource: DataSource,
  ) {}

  // Modifier aussi la méthode getOrderById pour inclure le client
  async getOrderById(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id_order: id },
      relations: ['client', 'orderDetails', 'orderDetails.product'],
    });

    if (!order) {
      throw new NotFoundException(`Commande ${id} non trouvée`);
    }

    return order;
  }
  // Lors de la création d'une commande, sauvegarder les deux prix
  async createOrderDetail(
    orderDetail: Partial<OrderDetail>,
  ): Promise<OrderDetail> {
    const product = await this.productRepository.findOne({
      where: { id_product: orderDetail.product_id },
    });

    const newOrderDetail = this.orderDetailRepository.create({
      ...orderDetail,
      original_price: product.price,
      unit_price: orderDetail.unit_price, // Prix avec promotion si applicable
    });

    return this.orderDetailRepository.save(newOrderDetail);
  }

  async updateOrder(
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.getOrderById(id);

      Object.assign(order, {
        date_order: updateOrderDto.date_order || order.date_order,
        id_statut: updateOrderDto.id_statut || order.id_statut,
      });

      if (updateOrderDto.orderLines?.length) {
        // Restaurer les stocks
        for (const detail of order.orderDetails) {
          const product = await this.productRepository.findOne({
            where: { id_product: detail.product.id_product },
          });
          if (product) {
            product.stock += detail.quantity;
            await queryRunner.manager.save(Product, product);
          }
        }

        // Supprimer les anciennes lignes
        await queryRunner.manager.delete(OrderDetail, {
          order: { id_order: id },
        });

        // Créer les nouvelles lignes
        const newDetails = await Promise.all(
          updateOrderDto.orderLines.map(async (line) => {
            const product = await this.productRepository.findOne({
              where: { id_product: line.id_product },
            });

            if (!product) {
              throw new NotFoundException(
                `Produit ${line.id_product} non trouvé`,
              );
            }

            if (product.stock < line.quantity) {
              throw new BadRequestException(
                `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}`,
              );
            }

            product.stock -= line.quantity;
            await queryRunner.manager.save(Product, product);

            return this.orderDetailRepository.create({
              order,
              product,
              quantity: line.quantity,
              unit_price: line.unit_price || product.price,
            });
          }),
        );

        await queryRunner.manager.save(OrderDetail, newDetails);

        order.montant_total = newDetails.reduce(
          (sum, detail) => sum + detail.quantity * detail.unit_price,
          0,
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
          where: { id_product: detail.product.id_product },
        });
        if (product) {
          product.stock += detail.quantity;
          await queryRunner.manager.save(Product, product);
        }
      }

      await queryRunner.manager.delete(OrderDetail, {
        order: { id_order: id },
      });
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
      order: { date_order: 'DESC' },
    });
  }
  // Ajouter la validation des transitions de statut

  async validatePayment(
    orderId: number,
    clientId: number,
    paymentInfo: any,
  ): Promise<Order> {
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

    console.log(`🔍 Vérification - clientId reçu: ${clientId}`);

    try {
      // 1. Récupérer les éléments du panier
      const cartItems = await this.cartRepository.find({
        where: { clientId },
        relations: ['product', 'product.promotion'], // Ajout de la relation promotion
      });

      console.log(`🛒 Nombre d'articles trouvés dans le panier: ${cartItems.length}`);

      if (!cartItems.length) {
        throw new BadRequestException('Le panier est vide');
      }

      // 2. Créer la commande
      const order = this.orderRepository.create({
        id_client: clientId,
        id_statut: 1,
        date_order: new Date(),
        montant_total: 0,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // 3. Créer les détails de commande avec original_price
      const orderDetails = await Promise.all(
        cartItems.map(async (item) => {
          // Vérifier le stock
          if (item.product.stock < item.quantity) {
            throw new BadRequestException(
              `Stock insuffisant pour ${item.product.name}. Disponible: ${item.product.stock}`,
            );
          }

          // Créer le détail de commande avec original_price
          const detail = this.orderDetailRepository.create({
            order: savedOrder,
            product: item.product,
            quantity: item.quantity,
            unit_price: item.price, // Prix avec promotion si applicable
            original_price: item.product.price, // Prix original du produit
          });

          // Mettre à jour le stock
          item.product.stock -= item.quantity;
          await queryRunner.manager.save(Product, item.product);

          return detail;
        }),
      );

      await queryRunner.manager.save(OrderDetail, orderDetails);

      // 4. Calculer le montant total
      savedOrder.montant_total = orderDetails.reduce(
        (sum, detail) => sum + detail.quantity * detail.unit_price,
        0,
      );
      await queryRunner.manager.save(Order, savedOrder);

      // 5. Vider le panier
      await queryRunner.manager.delete(Cart, { clientId });

      await queryRunner.commitTransaction();

      // Retourner la commande avec ses détails
      return this.getOrderById(savedOrder.id_order);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de la commande: ${error.message}`,
      );
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
        'client', // Pour avoir les informations du client
      ],
      order: {
        date_order: 'DESC', // Les plus récentes en premier
      },
    });
  }
  // Nouvelle méthode pour récupérer toutes les commandes
  async findAll(): Promise<Order[]> {
    // Remplacer la méthode existante par celle-ci
    return this.orderRepository.find({
      relations: ['client', 'orderDetails', 'orderDetails.product'],
      order: {
        date_order: 'DESC',
      },
    });
  }
  // src/model/Order/order.service.ts
  async updateOrderDetail(
    detailId: number,
    quantity: number,
  ): Promise<OrderDetail> {
    // Utiliser id_detail_commande au lieu de id
    const detail = await this.orderDetailRepository.findOne({
      where: { id_detail_commande: detailId },
      relations: ['product'],
    });

    if (!detail) {
      throw new NotFoundException('Détail de commande non trouvé');
    }

    // Vérifier le stock
    if (quantity > detail.product.stock) {
      throw new BadRequestException('Stock insuffisant');
    }

    detail.quantity = quantity;
    return this.orderDetailRepository.save(detail);
  }
  async deleteOrderDetail(detailId: number): Promise<void> {
    const result = await this.orderDetailRepository.delete(detailId);
    if (result.affected === 0) {
      throw new NotFoundException('Détail de commande non trouvé');
    }
  }
  async getOrdersByClientId(clientId: number): Promise<any[]> {
    return this.orderRepository.query(
      'SELECT * FROM get_order_details_with_prices($1)',
      [clientId],
    );
  }

  async createOrder(orderData: CreateOrderDto): Promise<any> {
    return this.orderRepository.query(
      'SELECT * FROM create_order_with_prices($1, $2, $3, $4)',
      [
        orderData.clientId,
        orderData.productId,
        orderData.quantity,
        orderData.unitPrice,
      ],
    );
  }

  async updateOrderStatus(orderId: number, statusId: number): Promise<any> {
    // Utiliser la procédure stockée créée précédemment
    const query = `
    UPDATE orders o
    SET id_statut = $2
    WHERE o.id_order = $1
    RETURNING o.id_order, o.id_statut, o.date_order, o.montant_total
  `;

    try {
      const result = await this.orderRepository.query(query, [
        orderId,
        statusId,
      ]);

      if (!result.length) {
        throw new NotFoundException(`Commande ${orderId} non trouvée`);
      }

      this.logger.debug(
        `Statut de la commande ${orderId} mis à jour avec succès`,
      );
      return result[0];
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour du statut: ${error.message}`,
      );
      throw error;
    }
  }
}
