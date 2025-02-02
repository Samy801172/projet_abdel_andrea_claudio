// Représente les produits que l'utilisateur ajoute dans le panier

import 'dart:convert';

class Product {
  final String id;  // Identifiant unique du produit
  final String nom;  // Nom du produit
  final double prix;  // Prix unitaire du produit
  final int quantite;  // Quantité ajoutée par l'utilisateur dans le panier
  final String description;  // Description du produit (facultatif)
  final String imageUrl;  // URL de l'image du produit (facultatif)

  // Constructeur
  Product({
    required this.id,
    required this.nom,
    required this.prix,
    required this.quantite,
    required this.description,
    required this.imageUrl,
  });

  // Méthode pour convertir un produit en Map (pour envoyer au backend)
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': nom,
      'prix': prix,
      'quantite': quantite,
      'description': description,
      'imageUrl': imageUrl,
    };
  }

  // Méthode pour créer un produit à partir d'un Map (par exemple, depuis une réponse JSON de l'API)
  factory Product.fromMap(Map<String, dynamic> map) {
    return Product(
      id: map['id'],
      nom: map['name'],
      prix: map['prix'],
      quantite: map['quantite'],
      description: map['description'] ?? '', // Si pas de description, on met une chaîne vide
      imageUrl: map['imageUrl'] ?? '', // Si pas d'image, on met une chaîne vide
    );
  }

  // Méthode pour convertir un produit en JSON
  String toJson() => json.encode(toMap());

  // Méthode pour créer un produit à partir de JSON
  factory Product.fromJson(String source) => Product.fromMap(json.decode(source));
}
