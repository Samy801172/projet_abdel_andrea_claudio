// Représente un article dans le panier + conversion entre JSON et DART

class CartItem {
  final String id; // Identifiant unique de l'article
  final String nom; // Nom du médicament
  final double prix; // prix du médicament avec ou sans promo
  final int quantite; // quantité demandée
  final String imageUrl; // url de l'image du médicament

  CartItem({
    required this.id,
    required this.nom,
    required this.prix,
    required this.quantite,
    required this.imageUrl,
  });

  // Convertir en JSON pour l'envoyer à l'API
  Map<String, dynamic> toJson() {
    return {
      'id_product': id,
      'name': nom,
      'price': prix,
      'quantity': quantite,
      'imageUrl': imageUrl,
    };
  }

  // Construire un objet CartItem depuis un JSON (Réponse de l'API)
  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id_product'].toString(),
      nom: json['name'],
      prix: json['price'].toDouble(),
      quantite: json['quantity'],
      imageUrl: json['imageUrl'],
    );
  }
}
