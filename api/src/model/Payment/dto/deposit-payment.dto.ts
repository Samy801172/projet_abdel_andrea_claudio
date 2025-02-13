import { IsNumber, IsString } from 'class-validator';



export class DepositPaymentDto {
    manufacturingRequestId: number;
    amount: number;
    depositPercentage: number;
    currency: string = 'EUR';
    clientId: number;
  }