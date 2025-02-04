import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  HttpStatus,
  Logger, Req
} from "@nestjs/common";
import { OrderService } from './order.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { User } from '@common/decorators';
import { Order } from './order.entity';
import { JwtAuthGuard } from '@feature/security/guard/jwt-auth.guard';
import { UpdateOrderDto } from './dto/update-order-.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { DataSource } from 'typeorm';
import { AuthGuard } from "@nestjs/passport";

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  private readonly logger = new Logger(OrderController.name);
  constructor(private readonly orderService: OrderService,
              private readonly dataSource: DataSource) {}

  // IMPORTANT: Route admin doit être AVANT les routes avec paramètres
  @Get('admin/all')
  @ApiOperation({
    summary: 'Récupérer toutes les commandes (Admin uniquement)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des commandes récupérée avec succès',
    type: [Order],
  })
  @ApiOperation({
    summary: 'Récupérer toutes les commandes (Admin uniquement)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des commandes récupérée avec succès',
    type: [Order],
  })
  async findAllOrders(@User('isAdmin') isAdmin: boolean) {
    this.logger.debug('Tentative de récupération de toutes les commandes');

    if (!isAdmin) {
      this.logger.warn(
        "Tentative d'accès non autorisé à la liste des commandes",
      );
      throw new BadRequestException('Accès réservé aux administrateurs');
    }

    try {
      const orders = await this.orderService.findAllOrders(); // Utiliser findAllOrders au lieu de findAll
      this.logger.debug(`${orders.length} commandes récupérées`);
      return orders;
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des commandes:', error);
      throw error;
    }
  }

  // Créer une commande
  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle commande' })
  async create(
    @User('clientId') clientId: number,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    // Vérifier que l'utilisateur crée une commande pour lui-même
    if (createOrderDto.clientId !== clientId) {
      throw new BadRequestException(
        'Vous ne pouvez créer une commande que pour vous-même',
      );
    }
    return this.orderService.createOrder(createOrderDto);
  }

  // Récupérer une commande spécifique
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une commande par son ID' })
  async findOne(
    @User('clientId') clientId: number,
    @User('isAdmin') isAdmin: boolean,
    @Param('id') id: string,
  ) {
    const order = await this.orderService.getOrderById(+id);

    // Vérification des droits d'accès
    if (!isAdmin && order.id_client !== clientId) {
      throw new BadRequestException(
        "Vous ne pouvez accéder qu'à vos propres commandes",
      );
    }

    return order;
  }

  // Récupérer toutes les commandes d'un client
  @Get('client/:clientId')
  @ApiOperation({ summary: "Récupérer toutes les commandes d'un client" })
  async findAllByClient(
    @User('clientId') currentClientId: number,
    @User('isAdmin') isAdmin: boolean,
    @Param('clientId') requestedClientId: string,
  ) {
    // Vérification des droits d'accès
    if (currentClientId !== +requestedClientId) {
      throw new BadRequestException(
        "Vous ne pouvez accéder qu'à vos propres commandes",
      );
    }

    return this.orderService.findAllByClient(+requestedClientId);
  }

  @Get()
  findAll() {
    return this.orderService.findAllOrders();
  }

  // récupère tout
  @Get('lol')
  @ApiOperation({ summary: 'Récupérer toutes les commandes (sans restriction admin)' })
  async findAllPublicOrders() {
    this.logger.debug('Récupération de toutes les commandes sans restriction');

    try {
      const orders = await this.orderService.findAllOrders(); // Récupère toutes les commandes
      this.logger.debug(`${orders.length} commandes récupérées`);
      return orders;
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des commandes:', error);
      throw error;
    }
  }


  // Mettre à jour une commande
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une commande' })
  async update(
    @User('clientId') clientId: number,
    @User('isAdmin') isAdmin: boolean,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const order = await this.orderService.getOrderById(+id);

    // Vérification des droits d'accès
    if (!isAdmin && order.id_client !== clientId) {
      throw new BadRequestException(
        'Vous ne pouvez modifier que vos propres commandes',
      );
    }

    return this.orderService.updateOrder(+id, updateOrderDto);
  }

  // Supprimer une commande (admin uniquement)
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une commande' })
  async remove(@User('isAdmin') isAdmin: boolean, @Param('id') id: string) {
    if (!isAdmin) {
      throw new BadRequestException(
        'Seul un administrateur peut supprimer une commande',
      );
    }

    return this.orderService.deleteOrder(+id);
  }

  // Mettre à jour le statut d'une commande (admin uniquement)

  // Valider le paiement d'une commande
  @Post(':id/payment')
  @ApiOperation({ summary: "Valider le paiement d'une commande" })
  async validatePayment(
    @User('clientId') clientId: number,
    @Param('id') orderId: string,
    @Body() paymentInfo: { paymentMethod: string },
  ) {
    return this.orderService.validatePayment(+orderId, clientId, paymentInfo);
  }
  @Delete('details/:detalId')
  @ApiOperation({ summary: 'Supprimer un détail de commande' })
  async deleteOrderDetail(
    @User('isAdmin') isAdmin: boolean,
    @Param('detailId') detailId: string,
  ) {
    if (!isAdmin) {
      throw new BadRequestException(
        'Seul un administrateur peut supprimer un détail de commande',
      );
    }
    return this.orderService.deleteOrderDetail(+detailId);
  }

  // Supprime un produit du détail de la commande

  @Delete('details/:detailId')
  @UseGuards(AuthGuard('jwt')) // Vérifie que l'utilisateur est authentifié
  async deleteProduct(@Param('id') id: number): Promise<{ message: string }> {
    console.log(`Suppression du produit avec l'ID : ${id}`);
    return { message: `Produit avec l'ID ${id} supprimé` };
  }



@Put('details/:detailId')
  @ApiOperation({ summary: 'Mettre à jour un détail de commande' })
  async updateOrderDetail(
    @User('isAdmin') isAdmin: boolean,
    @Param('detailId') detailId: string,
    @Body() updateData: { quantity: number },
  ) {
    if (!isAdmin) {
      throw new BadRequestException(
        'Seul un administrateur peut modifier un détail de commande',
      );
    }
    return this.orderService.updateOrderDetail(+detailId, updateData.quantity);
  }
  @Put(':id/status')
  async updateStatus(
    @User('isAdmin') isAdmin: boolean,
    @Param('id') orderId: string,
    @Body() statusInfo: { statusId: number },
  ): Promise<any> {
    if (!isAdmin) {
      throw new BadRequestException(
        'Seul un administrateur peut modifier le statut commande',
      );
    }


    try {
      const updatedOrder = await this.orderService.updateOrderStatus(
        +orderId,
        statusInfo.statusId,
      );

      this.logger.debug(
        `Statut de la commande ${orderId} mis à jour avec succès`,
      );
      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour du statut de la commande ${orderId}:`,
        error,
      );
      throw error;
    }
  }
}
