

// src/app/models/promotion.model.ts
// models/promotion/promotion.model.ts
import {OrderDetail} from '../order/order.model';
import {Product} from '../product/product.model';

export interface Promotion {
  id_promotion: number;
  description: string;
  startDate: Date | string;
  endDate: Date | string;
  discountPercentage: number;
}

export interface PromotionPayload {
  description: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
}
