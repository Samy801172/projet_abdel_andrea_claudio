// src/dto/update-product.dto.ts
export class UpdateProductDto {

  name?: string;
  description?: string;
  stock?: number;
  price?: number;
  active?: boolean;
  typeId?: number;
}
