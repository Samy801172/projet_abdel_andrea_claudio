import {
  Controller,
  Get,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { InvoiceService } from '../Invoice/invoice.service';
import { Response } from 'express';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get(':id/pdf')
  async generatePdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.invoiceService.generatePdf(+id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Facture_${id}.pdf`,
      });

      res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Erreur lors de la génération de la facture.',
      });
    }
  }
}
