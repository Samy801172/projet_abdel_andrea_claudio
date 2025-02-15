// Représente les produits que l'utilisateur peut voir
// dans la page productpage + pouvoir après ajouter/diminuer médicament

import 'dart:convert';

class Product {
  final int id; // Identifiant unique du produit
  final String nom; // Nom du produit
  final double prix; // Prix unitaire du produit
  final int quantite; // Quantité ajoutée par l'utilisateur dans le panier
  final String description; // Description du produit (facultatif)
  final String imageUrl; // URL de l'image du produit (facultatif)

  // 🔹 Constructeur du produit
  Product({
    required this.id,
    required this.nom,
    required this.prix,
    required this.quantite,
    required this.description,
    required this.imageUrl,
  });

  // 🔍 Méthode pour créer un produit à partir d'un Map (conversion API -> Objet Product)
  factory Product.fromMap(Map<String, dynamic> map) {
    print("🛠️ DEBUG - Données brutes reçues : ${jsonEncode(map)}");

    // Vérification et conversion sécurisée de l'ID
    int parsedId = 0;
    if (map.containsKey('id_product')) { // Vérification si id_product existe avant utilisation
      if (map['id_product'] is int) {
        parsedId = map['id_product']; // Vérification du type de id_product sinon conversion
      } else if (map['id_product'] is String) {
        parsedId = int.tryParse(map['id_product']) ?? 0; // Conversion String -> int ✅
      } else {
        print("⚠️ ERREUR : Type ID inattendu (${map['id_product']})");
      }
    } else {
      print("⚠️ ERREUR : Clé 'id_product' absente !");
    }

    return Product(
      id: parsedId, // ✅ Correction : l'ID sera toujours un entier
      nom: map['name'] ?? 'Nom inconnu',
      prix: double.tryParse(map['price'].toString()) ?? 0.0,
      quantite: (map['quantity'] is int) ? map['quantity'] : int.tryParse(map['quantity'].toString()) ?? 1,
      description: map['description'] ?? '',
      imageUrl: map['imageUrl'] ?? 'assets/image/defautproduit.png',
    );
  }

  // 🔄 Méthode pour convertir un produit en Map (Objet Product -> JSON API)
  Map<String, dynamic> toMap() {
    Map<String, dynamic> productMap = {
      'id_product': id,
      'name': nom,
      'price': prix,
      'quantity': quantite,
      'description': description,
      'imageUrl': imageUrl,
    };
    print("📦 DEBUG - Produit converti en Map : ${jsonEncode(productMap)}");
    return productMap;
  }

  // 📤 Convertit l'objet en JSON
  String toJson() {
    String jsonString = json.encode(toMap());
    print("📤 DEBUG - Produit converti en JSON : $jsonString");
    return jsonString;
  }

  // 📥 Convertit un JSON en objet `Product`
  factory Product.fromJson(String source) {
    print("📥 DEBUG - JSON reçu : $source");
    return Product.fromMap(json.decode(source));
  }
}
