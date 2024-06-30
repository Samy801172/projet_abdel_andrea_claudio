
<<<<<<< HEAD

=======
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673
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
