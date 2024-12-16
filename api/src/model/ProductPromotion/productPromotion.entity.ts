import { Product } from "model/Product/product.entity";
import { Promotion } from "model/Promotion/promotion.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('product_promotion')
export class ProductPromotion {
  @PrimaryGeneratedColumn()
  id_product_promotion: number;

  @Column({ name: 'id_product', type: 'int' })  // Assurez-vous que le nom correspond
  id_product: number;

  @Column({ name: 'id_promotion', type: 'int' })
  id_promotion: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'id_product' })  // Utilisez le même nom que la colonne
  product: Product;

  @ManyToOne(() => Promotion)
  @JoinColumn({ name: 'id_promotion' })
  promotion: Promotion;
}

