<<<<<<< HEAD
export class CreateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  statut_verif_identite_user?: string;
  type_user?: string;
  password?: string;
  subscriptionId?: number ;
=======


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
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673

}
