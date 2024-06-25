

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

  @ApiProperty()
  firstName: string;


  @ApiProperty()
  lastName: string;


  @ApiProperty()
  email: string;


  @ApiProperty()
  phone: string;


  @ApiProperty()
  statut_verif_identite_user?: string;


  @ApiProperty()
  type_user: string;


  @ApiProperty()
  password: string;


  @ApiProperty()
  subscription: { id: number };
}
