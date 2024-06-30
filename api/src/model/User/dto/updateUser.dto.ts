import { ApiProperty } from '@nestjs/swagger';



export class UpdateUserDto {

  @ApiProperty()
  firstName?: string;


  @ApiProperty()
  lastName?: string;


  @ApiProperty()
  email?: string;

  @ApiProperty()
  phone?: string;


  @ApiProperty()
  statut_verif_identite_user?: string;


  @ApiProperty()
  type_user?: string;


  @ApiProperty()
  password?: string;


  subscriptionId?: number;
  @ApiProperty()
  subscription?: { id: number };// Assuming you update subscription using its ID
}
