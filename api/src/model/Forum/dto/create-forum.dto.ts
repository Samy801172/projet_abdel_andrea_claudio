
import { ApiProperty } from '@nestjs/swagger';

export class CreateForumDto {

  @ApiProperty()
  name: string;


  @ApiProperty()
  description: string;


  @ApiProperty()
  date_message: Date;

  @ApiProperty()
  hour_message: Date;
}
