// src/model/Stock/dto/stock-alert.dto.ts
export class StockAlertDto {
  readonly product_id: number;
  readonly alert_type: string;
  readonly message: string;
}
