import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../Invoice/invoice.entity';

import PDFDocument = require('pdfkit');

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['order'], // Inclut la relation avec `Order`
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async generatePdf(id: number): Promise<Buffer> {
    const invoice = await this.findOne(id);

    console.log('Invoice:', invoice); // Vérifie les données récupérées

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    const doc = new PDFDocument();
    const buffer = [];

    doc.on('data', (chunk) => buffer.push(chunk));
    doc.on('end', () => console.log('PDF généré'));

    // Ajoute un contenu par défaut pour vérifier que le PDF fonctionne
    doc.fontSize(18).text(`Facture - ${invoice.invoiceNumber}`, { align: 'center' });
    doc.fontSize(12).text(`Date d'émission : ${invoice.issueDate}`);
    doc.text(`Client : ${invoice.clientName}`);
    doc.text(`Adresse de facturation : ${invoice.billingAddress}`);
    doc.text(`\nDétails de la commande :`);

    // Vérifie si les produits sont présents
    if (invoice.order?.orderDetails) {
      invoice.order.orderDetails.forEach((product) => {
        console.log('Produit:', product); // Log des produits
        doc.text(
          `${product.original_price} - Quantité : ${product.quantity} - Prix unitaire : ${product.unit_price.toFixed(
            2,
          )} EUR`,
        );
      });
    } else {
      doc.text('Aucun produit trouvé pour cette commande.');
    }

    doc.text(`\nTotal : ${invoice.totalAmount.toFixed(2)} EUR`);
    doc.text(`Statut du paiement : ${invoice.paymentStatus}`);
    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffer)));
      doc.on('error', (err) => reject(err));
    });
  }

}
