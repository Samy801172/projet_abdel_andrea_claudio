import {IsNumber, IsOptional } from "class-validator";

export class CreateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  statut_verif_identite_user?: string;
  type_user?: string;
  password?: string;
  @IsNumber()
  @IsOptional()
  subscriptionId?: number;


}
