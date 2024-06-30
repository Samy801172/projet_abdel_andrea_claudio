
export class CreateWalletDto {
  type_wallet: string;
  balance_wallet: number;

  constructor(type_wallet: string, balance_wallet: number) {
    this.type_wallet = type_wallet;
    this.balance_wallet = balance_wallet;
  }
}

