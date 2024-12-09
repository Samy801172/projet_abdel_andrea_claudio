// src/services/product.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Type } from '../Type/type.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Promotion } from 'model/Promotion/promotion.entity';


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
    return this.productRepository.find({ relations: ['type', 'carts', 'orderDetails', 'productPromotions'] });
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
}
