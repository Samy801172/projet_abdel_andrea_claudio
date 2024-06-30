export class CreateCryptocurrencyDto {
  name_crypto: string;
  value_crypto: number;

  constructor(name_crypto: string, value_crypto: number) {
    this.name_crypto = name_crypto;
    this.value_crypto = value_crypto;
  }
}
