export enum OrderStatusEnum {
  PENDING = 'En attente',
  PAID = 'Payé',
  PROCESSING = 'En cours de traitement',
  SHIPPED = 'Expédié',
  DELIVERED = 'Livré',
  CANCELLED = 'Annulé'
}
// Type pour
// le mapping des statuts aux couleurs
export type OrderStatusColor = {
  [key in OrderStatusEnum]: string;
};
// Constantes pour les couleurs des statuts
export const ORDER_STATUS_COLORS_STATUS: OrderStatusColor = {
  [OrderStatusEnum.PENDING]: '#fbbf24',    // Jaune
  [OrderStatusEnum.PAID]: '#22c55e',       // Vert vif
  [OrderStatusEnum.PROCESSING]: '#60a5fa', // Bleu
  [OrderStatusEnum.SHIPPED]: '#34d399',    // Vert clair
  [OrderStatusEnum.DELIVERED]: '#10b981',  // Vert
  [OrderStatusEnum.CANCELLED]: '#ef4444'   // Rouge
};
// Helper pour obtenir la classe CSS correspondant au statut
export function getStatusClass(status: string): string {
  const statusKey = Object.keys(OrderStatusEnum).find(
    key => OrderStatusEnum[key as keyof typeof OrderStatusEnum] === status
  );
  return statusKey ? `status-${statusKey.toLowerCase()}` : 'status-unknown';
}

// Helper pour obtenir la couleur correspondant au statut
export function getStatusColor(status: string): string {
  const statusKey = Object.keys(OrderStatusEnum).find(
    key => OrderStatusEnum[key as keyof typeof OrderStatusEnum] === status
  );
  return statusKey ? ORDER_STATUS_COLORS_STATUS[OrderStatusEnum[statusKey as keyof typeof OrderStatusEnum]] : '#9ca3af';
}
