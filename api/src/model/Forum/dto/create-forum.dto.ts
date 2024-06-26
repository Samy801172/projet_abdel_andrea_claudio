
import { ApiProperty } from '@nestjs/swagger';

export class CreateForumDto {

  @ApiProperty()
  name: string | undefined;


  @ApiProperty()
  description: string | undefined;


  @ApiProperty()
  date_message: Date | undefined;

  @ApiProperty()
  hour_message: Date | undefined;
}
