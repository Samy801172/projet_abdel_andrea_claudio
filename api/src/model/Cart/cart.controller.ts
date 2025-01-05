// src/model/Cart/cart.controller.ts
import { Controller, Post, Body, UseGuards, Req, Get, Put, Delete, Param, Logger } from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { JwtGuard } from '@feature/security';

@Controller('cart')
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  // Ajouter au panier
  @Post()
  @UseGuards(JwtGuard)
  async addToCart(@Req() request, @Body() createCartDto: CreateCartDto) {
    this.logger.debug(`Adding to cart - User: ${JSON.stringify(request.user)}`);
    this.logger.debug(`CreateCartDto: ${JSON.stringify(createCartDto)}`);

    const clientId = request.user.clientId;
    try {
      const result = await this.cartService.addToCart(clientId, createCartDto);
      this.logger.debug(`Add to cart result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Error adding to cart: ${error.message}`);
      throw error;
    }
  }

  // Récupérer le panier
  @Get()
  @UseGuards(JwtGuard)
  async getCart(@Req() request) {
    const clientId = request.user.clientId;
    this.logger.debug(`Getting cart for client: ${clientId}`);

    try {
      const cart = await this.cartService.getCartByClient(clientId);
      this.logger.debug(`Cart items found: ${cart.length}`);
      return cart;
    } catch (error) {
      this.logger.error(`Error getting cart: ${error.message}`);
      throw error;
    }
  }

  // Mettre à jour la quantité
  @Put(':id/quantity')
  @UseGuards(JwtGuard)
  async updateQuantity(
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto
  ) {
    return this.cartService.updateQuantity(
      parseInt(id, 10),
      updateCartDto.quantity
    );
  }

  // Supprimer du panier
  @Delete(':id')
  @UseGuards(JwtGuard)
  async removeFromCart(@Param('id') id: number) {
    return this.cartService.removeFromCart(id);
  }

  // Vider le panier
  @Delete('clear/:clientId')
  async clearCart(@Param('clientId') clientId: number) {
    return this.cartService.clearCart(clientId);
  }
}