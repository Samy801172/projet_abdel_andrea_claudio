// Gestion du Panier avec Provider
// Provider est un wrapper qui permet d'appeller les widgets hérités

import 'package:flutter/material.dart';
import '../Models/CartItem.dart';

class CartProvider with ChangeNotifier {
  // Dictionnaire qui stocke les articles du panier (clé = ID du produit, valeur = CartItem)
  final Map<String, CartItem> _items = {};

  // Getter pour récupérer les articles du panier
  Map<String, CartItem> get items => _items;

  // Calcule le prix total du panier de façon dynamique
  double get totalPrice {
    return _items.values.fold(0, (sum, item) => sum + (item.prix * item.quantite));
  }

  // Ajoute un article au panier ou met à jour la quantité s'il est déjà présent
  void addItem(CartItem item) {
    final String productId = item.id; // ✅ Vérification que c'est bien `id_product`
    print("🛒 Ajout au panier : ${item.nom}, ID = ${item.id}");

    if (item.id == "null" || item.id.isEmpty) {
      print("❌ ERREUR : ID NULL détecté dans CartProvider !");
      return; // Empêche l'ajout si l'ID est vide ou invalide
    }

    if (_items.containsKey(item.id)) {
      // Si l'article existe déjà, on augmente la quantité
      _items.update(
          productId,
            (existingItem) => CartItem(
          id: existingItem.id,
          nom: existingItem.nom,
          prix: existingItem.prix,
          quantite: existingItem.quantite + 1, // Augmentation de la quantité
          imageUrl: existingItem.imageUrl,
        ),
      );
    } else {
      // Sinon, on l'ajoute au panier
      _items.putIfAbsent(item.id, () => item);
    }
    print("📦 Contenu du panier : ${_items.keys.toList()}"); // 🔍 Vérification
    notifyListeners(); // Notifie l'interface utilisateur que le panier a changé
  }

  // Supprime un article du panier par son ID
  void removeItem(String productId) {
    if (_items.containsKey(productId)) {
      if (_items[productId]!.quantite > 1) {
        _items.update(
          productId,
              (existingItem) => CartItem(
            id: existingItem.id,
            nom: existingItem.nom,
            prix: existingItem.prix,
            quantite: existingItem.quantite - 1,
            imageUrl: existingItem.imageUrl,
          ),
        );
      } else {
        _items.remove(productId);
      }
      print("🗑️ Suppression : $productId, Contenu du panier : ${_items.keys.toList()}");
    notifyListeners(); // Mise à jour de l'UI
  }

  // Vide complètement le panier
  void clearCart() {
    _items.clear();
    notifyListeners();
  }
}
}