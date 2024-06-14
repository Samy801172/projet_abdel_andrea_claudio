
import { IsNotEmpty, IsString, IsDate } from 'class-validator';

export class CreateForumDto {
  @IsNotEmpty()
  @IsString()
  name: string | undefined;

  @IsNotEmpty()
  @IsString()
  description: string | undefined;

  @IsNotEmpty()
  @IsDate()
  date_message: Date | undefined;

  @IsNotEmpty()
  @IsDate()
  hour_message: Date | undefined;
}
