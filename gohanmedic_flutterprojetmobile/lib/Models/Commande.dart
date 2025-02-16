// 📦 Modèle représentant une commande client

import 'Product.dart'; // 📌 Import du modèle Product

class Commande {
  final String id; // 🆔 Numéro unique de la commande
  final DateTime orderDate; // 📅 Date de la commande
  final String status; // 🔄 Statut de la commande (en cours, livré, annulé...)
  final double montanttotal; // 💰 Montant total de la commande
  final List<Product> items; // 🛍️ Liste des produits commandés
  final String livraisonAddress; // 🏠 Adresse de livraison (optionnel)

  // 🏗️ **Constructeur**
  Commande({
    required this.id,
    required this.orderDate,
    required this.status,
    required this.montanttotal,
    required this.items,
    required this.livraisonAddress,
  });

  // 🛠️ **Convertir une Map en Commande (depuis API)**
  factory Commande.fromJson(Map<String, dynamic> json) {
    try {
      return Commande(
        id: json['order_id'].toString(), // ✅ Convertir en String au cas où
        orderDate: DateTime.tryParse(json['date_order'] ?? '') ?? DateTime.now(), // 🕒 Vérification
        status: json['status'] ?? 'Inconnu', // 🚨 Valeur par défaut si null
        montanttotal: (json['amount'] as num?)?.toDouble() ?? 0.0, // 💰 Gestion sécurisée
        items: (json['items'] as List<dynamic>?)?.map((item) => Product.fromJson(item)).toList() ?? [], // 🔄 Conversion des produits
        livraisonAddress: json['address'] ?? "Non spécifiée", // 📍 Adresse avec valeur par défaut
      );
    } catch (e) {
      print("❌ ERREUR lors de la conversion JSON -> Commande : $e");
      throw Exception("Impossible de créer une commande à partir du JSON");
    }
  }

  // 🔄 **Convertir une Commande en JSON (pour API)**
  Map<String, dynamic> toJson() {
    return {
      'order_id': id,
      'date_order': orderDate.toIso8601String(),
      'status': status,
      'amount': montanttotal,
      'items': items.map((item) => item.toJson()).toList(),
      'address': livraisonAddress,
    };
  }
}