import { IsOptional, IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  address?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  avatar?: string;

  // Champs liés à Credential
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ default: false })
  isAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ default: true })
  active?: boolean;
}
