import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateManufacturingDto {
    @ApiProperty()
    @IsNotEmpty()
    orderId: number;
    
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    depositAmount: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    totalAmount: number;
} 