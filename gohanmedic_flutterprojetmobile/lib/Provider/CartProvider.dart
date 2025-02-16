// Permet la gestion du panier + faire le lien avec le backend

import 'package:flutter/material.dart';
import '../Models/CartItem.dart';
import '../Services/apiservice.dart';
import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CartProvider with ChangeNotifier {
  // 🛒 Stockage local des articles du panier (clé = ID du produit, valeur = CartItem)
  final Map<int, CartItem> _items = {};

  // 📌 Getter pour récupérer les articles du panier
  Map<int, CartItem> get items => _items;

  // 📌 Calcul dynamique du prix total du panier
  double get totalPrice {
    return _items.values.fold(0, (sum, item) => sum + (item.prix * item.quantite));
  }

  // 🔵 Récupérer le panier depuis l'API au démarrage
  Future<void> fetchCartFromServer(int? clientId, BuildContext context) async {
    if (clientId == null || clientId <= 0) {
      print("❌ ERREUR : clientId invalide ($clientId), redirection vers la page de connexion...");

      // 🚨 Redirection vers `/login` si le clientId est null
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

  // 🛒 Ajouter un produit dans le panier (local + API)
  Future<void> addItem(CartItem item, int? clientId, BuildContext context) async {
    if (clientId == null) {
      print("❌ ERREUR : clientId est NULL, redirection vers la page de connexion...");
      Future.microtask(() {
        Navigator.pushReplacementNamed(context, '/login');
      });
      return;
    }

    final int productId = item.id;
    print("🛒 Ajout au panier : ${item.nom}, ID = $productId");

    try {
      // 🔄 Envoie à l'API
      await ApiService.addToCart(clientId, productId, 1);

      // 📦 Mise à jour locale après succès API
      if (_items.containsKey(productId)) {
        _items.update(
          productId,
              (existingItem) => existingItem.copyWith(quantite: existingItem.quantite + 1),
        );
      } else {
        _items.putIfAbsent(productId, () => item);
      }

      print("📦 Contenu du panier après ajout : ${_items.keys.toList()}");
      notifyListeners();
    } catch (e) {
      print("❌ [CartProvider] Erreur lors de l'ajout au panier : $e");
    }
  }

  // 🔴 Supprimer un produit du panier (local + API)
  Future<void> removeItem(int productId, int? clientId, BuildContext context) async {
    if (clientId == null) {
      print("❌ ERREUR : clientId est NULL, redirection vers la page de connexion...");
      Future.microtask(() {
        Navigator.pushReplacementNamed(context, '/login');
      });
      return;
    }

    if (_items.containsKey(productId)) {
      if (_items[productId]!.quantite > 1) {
        // Réduire la quantité du produit
        _items.update(
          productId,
              (existingItem) => existingItem.copyWith(
            quantite: existingItem.quantite - 1,
          ),
        );
      } else {
        // Supprimer le produit si la quantité atteint 0
        _items.remove(productId);
      }

      print("🗑️ Produit retiré, ID = $productId, Contenu du panier : ${_items.keys.toList()}");

      // 🔄 Mettre à jour le panier côté serveur
      await _syncCartWithServer(clientId);
    }
  }

  // 🔥 Vider complètement le panier (local + API)
  Future<void> clearCart(int? clientId, BuildContext context) async {
    if (clientId == null) {
      print("❌ ERREUR : clientId est NULL, redirection vers la page de connexion...");
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

  // 🔄 Synchronisation du panier avec l'API (mise à jour)
  Future<void> _syncCartWithServer(int clientId) async {
    try {
      print("📡 [API] Synchronisation du panier avec l'API pour client ID : $clientId...");

      // 🔥 Récupération du token JWT stocké
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      if (token == null) {
        print("❌ Aucun token trouvé !");
        throw Exception("Utilisateur non authentifié");
      }

      // 🔄 Mise à jour du panier dans l'API, produit par produit
      for (var item in _items.values) {
        print("🔄 Mise à jour API - Produit ID: ${item.id}, Quantité: ${item.quantite}");
        await ApiService.updateCart(clientId, item.id, item.quantite);
      }

      print("✅ [API] Panier synchronisé avec succès !");
      notifyListeners();
    } catch (e) {
      print("❌ [API] Erreur lors de la synchronisation du panier : $e");
    }
  }
}