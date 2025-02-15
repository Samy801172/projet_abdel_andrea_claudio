// 🛒 Gestion du Panier avec Provider
// Ce fichier gère l'ajout, la suppression et la synchronisation du panier avec l'API backend.

import 'package:flutter/material.dart';
import '../Models/CartItem.dart';
import '../Services/apiservice.dart';
import 'package:flutter/widgets.dart';

class CartProvider with ChangeNotifier {
  // 🔄 Stockage des articles du panier (clé = ID du produit, valeur = CartItem)
  final Map<int, CartItem> _items = {};

  // 📌 Getter pour récupérer les articles du panier
  Map<int, CartItem> get items => _items;

  // 📌 Calcul dynamique du prix total du panier
  double get totalPrice {
    return _items.values.fold(0, (sum, item) => sum + (item.prix * item.quantite));
  }

  // 🔵 Récupérer le panier depuis l'API au lancement de l'application
  Future<void> fetchCartFromServer(int? clientId, BuildContext context) async {
    if (clientId == null || clientId <= 0) {
      print("❌ ERREUR : clientId invalide ($clientId), redirection vers la page de connexion...");

      // 🚨 Rediriger vers la page de connexion si clientId est null
      Future.microtask(() {
        Navigator.pushReplacementNamed(context, '/login');
      });
      return;
    }

    try {
      print("📡 [API] Chargement du panier depuis l'API pour client ID : $clientId...");

      // 🔄 Récupération des données du panier via l'API
      final List<CartItem> serverCart = await ApiService.fetchCart(clientId);

      // 🛒 Mise à jour du panier local
      _items.clear();
      for (var item in serverCart) {
        _items[item.id] = item;
      }

      print("✅ [API] Panier chargé avec succès : ${_items.keys.toList()}");
      notifyListeners();
    } catch (e) {
      print("❌ [API] Erreur lors du chargement du panier : $e");
    }
  }

  // 🔄 Ajouter un produit dans l'API et dans le Provider
  Future<void> addItem(CartItem item, int? clientId, BuildContext context) async {
    if (clientId == null) {
      print("❌ ERREUR : clientId est NULL, redirection vers la page de connexion...");

      // 🚨 Redirection vers `/login` si le clientId est null
      Future.microtask(() {
        Navigator.pushReplacementNamed(context, '/login');
      });
      return;
    }

    final int productId = item.id;
    print("🛒 Ajout au panier : ${item.nom}, ID = $productId");

    if (_items.containsKey(productId)) {
      // Si le produit existe déjà, on augmente juste la quantité
      _items.update(
        productId,
            (existingItem) => CartItem(
          id: existingItem.id,
          nom: existingItem.nom,
          prix: existingItem.prix,
          quantite: existingItem.quantite + 1,
          imageUrl: existingItem.imageUrl,
          description: existingItem.description,
        ),
      );
    } else {
      // Sinon, on l'ajoute
      _items.putIfAbsent(productId, () => item);
    }

    print("📦 Contenu du panier après ajout : ${_items.keys.toList()}");

    // 🔄 Mettre à jour le panier côté serveur
    await _syncCartWithServer(clientId);
  }

  // 🔴 Supprimer un produit du panier côté API et local
  Future<void> removeItem(int productId, int? clientId, BuildContext context) async {
    if (clientId == null) {
      print("❌ ERREUR : clientId est NULL, redirection vers la page de connexion...");

      // 🚨 Redirection vers `/login`
      Future.microtask(() {
        Navigator.pushReplacementNamed(context, '/login');
      });
      return;
    }

    if (_items.containsKey(productId)) {
      if (_items[productId]!.quantite > 1) {
        // On réduit la quantité du produit
        _items.update(
          productId,
              (existingItem) => CartItem(
            id: existingItem.id,
            nom: existingItem.nom,
            prix: existingItem.prix,
            quantite: existingItem.quantite - 1,
            imageUrl: existingItem.imageUrl,
            description: existingItem.description,
          ),
        );
      } else {
        // Si c'était le dernier, on le supprime
        _items.remove(productId);
      }

      print("🗑️ Produit retiré, ID = $productId, Contenu du panier : ${_items.keys.toList()}");

      // 🔄 Mettre à jour le panier côté serveur
      await _syncCartWithServer(clientId);
    }
  }

  // 🔥 Vider complètement le panier et synchroniser avec l'API
  Future<void> clearCart(int? clientId, BuildContext context) async {
    if (clientId == null) {
      print("❌ ERREUR : clientId est NULL, redirection vers la page de connexion...");

      // 🚨 Redirection vers `/login`
      Future.microtask(() {
        Navigator.pushReplacementNamed(context, '/login');
      });
      return;
    }

    print("🗑️ Vider le panier...");
    _items.clear();
    await ApiService.clearCart(clientId);
    notifyListeners();
  }

  // 🔄 Fonction privée pour synchroniser le panier avec l'API
  Future<void> _syncCartWithServer(int clientId) async {
    try {
      print("📡 [API] Synchronisation du panier avec l'API pour client ID : $clientId...");

      await ApiService.updateCart(clientId, _items.values.toList());

      print("✅ [API] Panier synchronisé avec succès !");
      notifyListeners();
    } catch (e) {
      print("❌ [API] Erreur lors de la synchronisation du panier : $e");
    }
  }
}