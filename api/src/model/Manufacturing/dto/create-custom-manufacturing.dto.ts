import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCustomManufacturingDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    prescription: any;

    @ApiProperty()
    @IsString()
    @IsOptional()
    notes?: string;
} 