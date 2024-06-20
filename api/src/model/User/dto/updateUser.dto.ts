import { IsString, IsEmail, IsOptional } from 'class-validator';


export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  statut_verif_identite_user?: string;

  @IsString()
  @IsOptional()
  type_user?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsOptional()
  subscription?: { id: number };// Assuming you update subscription using its ID
}
