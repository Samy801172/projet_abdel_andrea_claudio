// models/cart/cart-item.model.ts
export interface CartItem {
  id: number;          // ID de l'entrée dans le panier
  productId: number;   // ID du produit
  quantity: number;
  product: {
    id_product: number;
    name: string;
    price: string | number;
    stock: number;
    description?: string;
  };
}
