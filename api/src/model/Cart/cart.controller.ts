import { Controller, Post, Body, UseGuards, Req, Get, Put, Delete, Param } from '@nestjs/common';
import { CartService } from './cart.service';

import { UpdateCartDto } from './dto/update-cart.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { JwtGuard } from '@feature/security';

@Controller('cart')  // Notez: pas de 'api' ici car c'est généralement configuré globalement
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @UseGuards(JwtGuard)
  async addToCart(@Req() request, @Body() createCartDto: CreateCartDto) {
    const clientId = request.user.clientId;
    return this.cartService.addToCart(clientId, createCartDto);
  }

  @Get()
  @UseGuards(JwtGuard)
  async getCart(@Req() request) {
    const clientId = request.user.clientId;
    return this.cartService.getCartByClient(clientId);
  }

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
  @Delete(':id')
  @UseGuards(JwtGuard)
  async removeFromCart(@Param('id') id: number) {
    return this.cartService.removeFromCart(id);
  }
  @Delete('clear/:clientId')
  async clearCart(@Param('clientId') clientId: number): Promise<void> {
    return this.cartService.clearCart(clientId);
  }
}