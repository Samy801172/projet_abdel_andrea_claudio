
import { Controller } from '@nestjs/common';
import { CryptomoneyService } from './cryptomoney.service';

/**
 * The CryptomoneyController class is a NestJS controller that handles HTTP requests
 * for operations related to cryptocurrencies.
 * It uses the CryptomoneyService to interact with the underlying data and business logic.
 */
@Controller('cryptomoney')
export class CryptomoneyController {
  // The constructor injects the CryptomoneyService for use in the controller methods.
  constructor(private readonly cryptomoneyService: CryptomoneyService) {}

  // Endpoint methods for handling cryptocurrency operations will be defined here.
}
