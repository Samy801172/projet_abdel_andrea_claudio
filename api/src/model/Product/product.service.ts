// src/services/product.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Type } from '../Type/type.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Promotion } from 'model/Promotion/promotion.entity';


export interface ProductWithPromotion {
  id_product: number;
  name: string;
  description: string;
  price: number;
  stock: number; // Renommez 'quantity' en 'stock'
  type?: Type; // Relation avec le type
  activePromotion?: {
    id_promotion: number;
    description: string;
    discountPercentage: number;
    startDate: Date;
    endDate: Date;
  };
  promotionPrice: number;
}


@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const type = await this.typeRepository.findOne({ where: { id_type: createProductDto.typeId } });
    if (!type) {
      throw new NotFoundException('Type not found');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      type,
    });
    return this.productRepository.save(product);
  }
  async findAll(): Promise<Product[]> {
    // Modifier pour inclure les relations complètes
    return this.productRepository.find({
      relations: [
        'type',
        'carts',
        'orderDetails',
        'productPromotions',
        'productPromotions.promotion'  // Important: ajouter cette relation
      ]
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id_product: id },
      relations: ['type', 'carts', 'orderDetails', 'productPromotions'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.typeId) {
      const type = await this.typeRepository.findOne({ where: { id_type: updateProductDto.typeId } });
      if (!type) {
        throw new NotFoundException('Type not found');
      }
      product.type = type;
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async applyPromotion(productId: number, promotionId: number) {
    const product = await this.productRepository.findOne({
      where: { id_product: productId }
    });

    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${productId} non trouvé`);
    }

    const promotion = await this.promotionRepository.findOne({
      where: { id_promotion: promotionId }
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion avec l'ID ${promotionId} non trouvée`);
    }

    // Vérifier que la promotion est active
    const now = new Date();
    if (promotion.startDate > now || promotion.endDate < now) {
      throw new BadRequestException('La promotion n\'est pas active');
    }

    // Appliquer la promotion au produit
    product.promotion = promotion;
    await this.productRepository.save(product);

    return product;
  }
  async getAllProducts(): Promise<ProductWithPromotion[]> {
    const products = await this.findAll();
    const now = new Date();

    return products.map(product => {
      // Vérifier d'abord la promotion directe
      if (product.promotion &&
        now >= new Date(product.promotion.startDate) &&
        now <= new Date(product.promotion.endDate)) {
        return {
          id_product: product.id_product,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          type: product.type,
          activePromotion: {
            id_promotion: product.promotion.id_promotion,
            description: product.promotion.description,
            discountPercentage: product.promotion.discountPercentage,
            startDate: product.promotion.startDate,
            endDate: product.promotion.endDate,
          },
          promotionPrice: this.calculatePromotionalPrice(
            product.price,
            product.promotion.discountPercentage
          )
        };
      }

      // Si pas de promotion directe, chercher dans productPromotions
      const activePromotion = product.productPromotions?.find(pp => {
        return now >= new Date(pp.promotion.startDate) &&
          now <= new Date(pp.promotion.endDate);
      });

      if (activePromotion) {
        return {
          ...product,
          activePromotion: {
            id_promotion: activePromotion.promotion.id_promotion,
            description: activePromotion.promotion.description,
            discountPercentage: activePromotion.promotion.discountPercentage,
            startDate: activePromotion.promotion.startDate,
            endDate: activePromotion.promotion.endDate,
          },
          promotionPrice: this.calculatePromotionalPrice(
            product.price,
            activePromotion.promotion.discountPercentage
          )
        };
      }

      return {
        ...product,
        activePromotion: null,
        promotionPrice: product.price
      };
    });
  }



  private calculatePromotionalPrice(price: number, discountPercentage: number): number {
    return Number((price * (1 - discountPercentage / 100)).toFixed(2));
  }


}
