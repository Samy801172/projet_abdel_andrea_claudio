import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Alexandre', description: 'barth' })
  firstName: string = 'Alexandre';

  @ApiProperty({ example: 'Dupont', description: 'barth' })
  lastName: string = 'Dupont';

  @ApiProperty({ example: 'alexandre.dupont@example.com', description: 'barth' })
  email: string = 'alexandre.dupont@example.com';

  @ApiProperty({ example: '+32470123456', description: 'barth' })
  phone: string = '+32470123456';

  @ApiProperty({ example: 'client', description: 'barth' })
  type_user: string = 'client';

  @ApiProperty({ example: 'motdepasse123', description: 'barth' })
  password: string = 'motdepasse123';
  wallets: any;


}