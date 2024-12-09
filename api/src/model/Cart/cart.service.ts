// 3. cart.service.ts (backend)
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { Client } from '../Client/client.entity';
import { Product } from '../Product/product.entity';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);


  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Client)  // Ajout du ClientRepository
    private readonly clientRepository: Repository<Client>
  ) {}

  async addToCart(clientId: number, dto: CreateCartDto): Promise<Cart> {
    try {
      // Vérifier le client
      const client = await this.clientRepository.findOne({
        where: { clientId }
      });

      if (!client) {
        this.logger.error(`Client non trouvé: ${clientId}`);
        throw new NotFoundException(`Client ${clientId} non trouvé`);
      }

      // Vérifier le produit
      const product = await this.productRepository.findOne({
        where: { id_product: dto.productId }
      });

      if (!product) {
        this.logger.error(`Produit non trouvé: ${dto.productId}`);
        throw new NotFoundException(`Produit ${dto.productId} non trouvé`);
      }

      // Vérifier le stock
      if (product.stock < dto.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}`
        );
      }

      // Vérifier si le produit est déjà dans le panier
      let cartItem = await this.cartRepository.findOne({
        where: {
          clientId,
          productId: dto.productId
        }
      });

      if (cartItem) {
        // Mettre à jour la quantité
        cartItem.quantity += dto.quantity;
        this.logger.log(`Mise à jour quantité panier: ${cartItem.quantity}`);
        return this.cartRepository.save(cartItem);
      }

      // Créer un nouvel item dans le panier
      cartItem = this.cartRepository.create({
        client,
        product,
        clientId,
        productId: dto.productId,
        quantity: dto.quantity
      });

      this.logger.log('Nouvel item ajouté au panier:', cartItem);
      return this.cartRepository.save(cartItem);

    } catch (error) {
      this.logger.error('Erreur ajout au panier:', error);
      throw error;
    }
  }


  async getCartByClient(clientId: number): Promise<Cart[]> {
    return this.cartRepository.find({
      where: { clientId },
      relations: ['product']
    });
  }

  // 3. cart.service.ts (backend)
  async removeFromCart(cartId: number): Promise<void> {
    try {
      const result = await this.cartRepository.delete(cartId);
      if (result.affected === 0) {
        console.error(`Aucun élément trouvé avec l'ID: ${cartId}`);
        throw new NotFoundException('Article de panier non trouvé');
      }
      console.log(`Produit avec l'ID ${cartId} supprimé du panier.`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du produit avec l'ID ${cartId}:`, error);
      throw new NotFoundException('Erreur lors de la suppression du produit');
    }
  }
  async updateQuantity(cartItemId: number, quantity: number): Promise<Cart> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartItemId },
      relations: ['product']
    });

    if (!cartItem) {
      throw new NotFoundException('Article non trouvé dans le panier');
    }

    if (quantity <= 0) {
      throw new BadRequestException('La quantité doit être supérieure à 0');
    }

    if (quantity > cartItem.product.stock) {
      throw new BadRequestException('Quantité demandée supérieure au stock disponible');
    }

    cartItem.quantity = quantity;
    return this.cartRepository.save(cartItem);
  }
  // Méthode pour vider le panier
  async clearCart(clientId: number): Promise<void> {
    try {
      // Vérifier le client
      const client = await this.clientRepository.findOne({
        where: { clientId }
      });

      if (!client) {
        throw new NotFoundException(`Client ${clientId} non trouvé`);
      }

      await this.cartRepository.delete({ clientId });
    } catch (error) {
      this.logger.error(`Erreur vidage panier:`, error);
      throw new BadRequestException('Erreur lors du vidage du panier');
    }
  }

}
