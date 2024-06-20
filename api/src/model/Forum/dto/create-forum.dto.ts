
import { IsNotEmpty, IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateForumDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string | undefined;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  description: string | undefined;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty()
  date_message: Date | undefined;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty()
  hour_message: Date | undefined;
}
