// src/model/productPromotion.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../Product/product.entity'; // Produit
import { Promotion } from '../Promotion/promotion.entity'; // Promotion

@Entity('product_promotion')
export class ProductPromotion {
  @PrimaryGeneratedColumn()
  id_product_promotion: number; // Identifiant unique pour cette relation

  @ManyToOne(() => Product, (product) => product.productPromotions)
  @JoinColumn({ name: 'id_product' })
  product: Product; // Clé étrangère vers le produit

  @ManyToOne(() => Promotion, (promotion) => promotion.productPromotions)
  @JoinColumn({ name: 'id_promotion' })
  promotion: Promotion; // Clé étrangère vers la promotion
}
