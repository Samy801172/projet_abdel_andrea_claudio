// Stock les informations des commandes d'un client

import 'Product.dart'; // Import du modèle

class Commande {
  final String id; // Numéro de commande
  final DateTime orderDate; // Date de commande
  final String status; // Statut (en cours, livré, annulé...)
  final double montanttotal; // Montant total payé
  final List<Product> items; // Liste des produits commandés
  final String livraisonAddress; // Adresse de livraison (optionnel)

  Commande({
    required this.id,
    required this.orderDate,
    required this.status,
    required this.montanttotal,
    required this.items,
    required this.livraisonAddress,
  });

  // Convertir JSON en objet Order
  factory Commande.fromMap(Map<String, dynamic> data) {
    return Commande(
      id: data['order_id'],
      orderDate: DateTime.parse(data['date_order']),
      status: data['status'],
      montanttotal: data['amount'].toDouble(),
      items: (data['items'] as List).map((item) => Product.fromMap(item)).toList(),
      livraisonAddress: data['address'] ?? "",
    );
  }

  // Convertir un objet Order en JSON
  Map<String, dynamic> toMap() {
    return {
      'order_id': id,
      'date_order': orderDate.toIso8601String(),
      'status': status,
      'amount': montanttotal,
      'items': items.map((item) => item.toMap()).toList(),
      'address': livraisonAddress,
    };
  }
}
