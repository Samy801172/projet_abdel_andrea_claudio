// Représente la création d'un paiement lorsque le client valide son panier et qu'il va devoir payer

import 'package:gohanmedic_flutterprojetmobile/Models/Product.dart';

class Payment {
  final String id; // Identifiant unique du paiement
  final double total; // Montant du paiement
  final String status; // Statut du paiement (par exemple : 'pending', 'completed', 'failed')
  final List<Product> items; // Liste des produits achetés dans ce paiement
  final DateTime paymentDate; // Date de la transaction

  Payment({
    required this.id,
    required this.total,
    required this.status,
    required this.items,
    required this.paymentDate,
  });

  // Méthode pour convertir l'objet Payment en map (utile pour envoyer au backend)
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'amount': total,
      'status': status,
      'items': items.map((item) => item.toMap()).toList(),
      'paymentDate': paymentDate.toIso8601String(),
    };
  }

  // Créer un paiement à partir de données reçues (par exemple, après un paiement réussi)
  factory Payment.fromMap(Map<String, dynamic> map) {
    var items = (map['items'] as List).map((item) => Product.fromMap(item)).toList();
    return Payment(
      id: map['id'],
      total: map['amount'],
      status: map['status'],
      items: items,
      paymentDate: DateTime.parse(map['paymentDate']),
    );
  }
}