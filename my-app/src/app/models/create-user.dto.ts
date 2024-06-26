

export class CreateUserDto {


  firstName!: string;


  lastName!: string;


  email!: string;


  phone!: string;

  statut_verif_identite_user?: string;


  type_user!: string;

  password!: string;


  subscription!: { id: number };
  constructor() {
    this.subscription = { id: 0 };
  }

}
