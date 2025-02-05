// Gestion du Panier avec Provider
// Provider est un wrapper qui permet d'appeller les widgets hérités

import 'package:flutter/material.dart';
import '../models/CartItem.dart';

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
    if (_items.containsKey(item.id)) {
      // Si l'article existe déjà, on augmente la quantité
      _items.update(
        item.id,
            (existingItem) => CartItem(
          id: existingItem.id,
          nom: existingItem.nom,
          prix: existingItem.prix,
          quantite: existingItem.quantite + 1,
          imageUrl: existingItem.imageUrl,
        ),
      );
    } else {
      // Sinon, on l'ajoute au panier
      _items.putIfAbsent(item.id, () => item);
    }
    notifyListeners(); // Notifie l'interface utilisateur que le panier a changé
  }

  // Supprime un article du panier par son ID
  void removeItem(String id) {
    _items.remove(id);
    notifyListeners(); // Mise à jour de l'UI
  }

  // Vide complètement le panier
  void clearCart() {
    _items.clear();
    notifyListeners();
  }
}