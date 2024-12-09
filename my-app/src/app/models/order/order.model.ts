// models/order/order.model.ts
import {Client} from '../client/client.model';

export interface NewOrder {
  id_client: number;
  id_statut: number;
  date_order: Date;
  orderLines: Array<{
    id_product: number;  // Changé de productId pour correspondre au backend
    quantity: number;
    unit_price: number;
  }>;
}


export interface OrderDetail {
  id_order_detail: number;
  quantity: number;
  unit_price: number;
  product: {
    id_product: number;
    name: string;
  };
}

export interface Order {
  id_order: number;
  date_order: Date;
  id_statut: number;
  id_client: number;
  montant_total: number;
  orderDetails: OrderDetail[];
  client?: {
    firstName: string;
    lastName: string;
    address: string;
  };
  status?: string;
}


export interface OrderDetail {
  id_order_detail: number; // Gardons le nom utilisé dans le composant pour l'instant
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product: {
    id_product: number;
    name: string;
  };
}
