// models/product/product.model.ts
export interface Product {
  id_product: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  active: boolean;
  imageUrls: string[];
  quantity?: number;
  isPromoted?: boolean;
  promotionPrice?: number;
  typeId?: number; // Pour lier le produit à un type
}

export interface NewProduct {
  name: string;
  description: string;
  stock: number;
  price: number;
  active: boolean;
  typeId?: number;
  imageUrls?: string[];
}

export interface ProductWithPromotion extends Product {
  activePromotion?: {
    id_promotion: number;
    description: string;
    discountPercentage: number;
  };
  selectedPromotionId?: number;
  promotionPrice?: number;
}
