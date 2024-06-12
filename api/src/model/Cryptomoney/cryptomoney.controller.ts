import { Controller } from '@nestjs/common';
import { CryptomoneyService } from './cryptomoney.service';

@Controller('cryptomoney')
export class CryptomoneyController {
  constructor(private readonly cryptomoneyService: CryptomoneyService) {}


}
