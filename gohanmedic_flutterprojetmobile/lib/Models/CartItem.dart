// 📦 Représente un article dans le panier + conversion entre JSON et Dart
class CartItem {
  final int id; // 🆔 Identifiant unique du produit
  final String nom; // 🏷️ Nom du médicament
  final double prix; // 💰 Prix avec ou sans promotion
  final int quantite; // 🔢 Quantité demandée
  final String imageUrl; // 🖼️ URL de l'image
  final String description; // 📝 Description (valeur par défaut si null)

  CartItem({
    required this.id,
    required this.nom,
    required this.prix,
    required this.quantite,
    required this.imageUrl,
    this.description = "Description non disponible", // ✅ Ajout de valeur par défaut
  });

  // 🔄 Convertir un objet `CartItem` en JSON pour l'API
  Map<String, dynamic> toJson() {
    return {
      'id_product': id,
      'name': nom,
      'price': prix,
      'quantity': quantite,
      'imageUrl': imageUrl,
      'description': description,
    };
  }

  // 🔄 Construire un objet `CartItem` depuis une réponse JSON de l'API
  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id_product'] is int
          ? json['id_product'] // ✅ ID est déjà un int
          : int.tryParse(json['id_product'].toString()) ?? 0, // 🔄 Conversion sécurisée

      nom: json['name'] ?? "Produit inconnu", // 🏷️ Gérer un éventuel `null`

      prix: json['price'] is double
          ? json['price'] // ✅ Déjà un double
          : double.tryParse(json['price'].toString()) ?? 0.0, // 🔄 Conversion sécurisée

      quantite: json['quantity'] is int
          ? json['quantity']
          : int.tryParse(json['quantity'].toString()) ?? 1, // 🔄 Valeur par défaut = 1

      imageUrl: json['imageUrl'] ??
          'assets/image/defautproduit.png', // 🖼️ Image par défaut

      description: json['description'] ?? "Description non disponible", // 📝 Valeur par défaut
    );
  }
}