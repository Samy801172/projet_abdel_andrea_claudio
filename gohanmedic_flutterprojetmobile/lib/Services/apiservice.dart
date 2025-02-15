// 📡 Service d'appel à l'API pour gérer les données et la communication avec le backend

import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/config.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/HttpStatus.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/CartItem.dart';

class ApiService {
  // 🌍 URL de base pour l'API
  static const String baseUrl = Config.apiUrl;

  // 🔄 Fonction pour récupérer la liste des produits depuis l'API
  static Future<List<dynamic>> fetchProducts() async {
    try {
      print("📡 [API] Récupération des produits...");

      final response = await http
          .get(Uri.parse('$baseUrl/products'))
          .timeout(const Duration(seconds: 10)); // ⏳ Timeout de 10 secondes

      print("🔵 [API] Statut HTTP reçu: ${response.statusCode}");

      // ✅ Vérification de la réponse API (200 OK ou 201 Created)
      if ((response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) &&
          response.body.isNotEmpty) {
        final List<dynamic> data = json.decode(response.body);

        print("📦 [API] Produits récupérés : ${data.length} articles");

        return data; // 🚀 Retourne la liste des produits
      } else {
        print("❌ [API] Erreur - Statut ${response.statusCode}");
        throw Exception("Erreur API : Statut ${response.statusCode}");
      }
    } on http.ClientException catch (e) {
      print("❌ [API] Erreur réseau : $e");
      throw Exception("Erreur réseau");
    } on TimeoutException {
      print("⏳ [API] Temps d’attente dépassé");
      throw Exception("Temps d’attente dépassé");
    } catch (e) {
      print("❌ [API] Erreur inconnue : $e");
      throw Exception("Erreur inconnue");
    }
  }

  // 🛒 Récupérer le panier du client depuis l'API
  static Future<List<CartItem>> fetchCart(int clientId) async {
    try {
      print("📡 [API] Récupération du panier pour client ID: $clientId...");

      final response = await http
          .get(Uri.parse('$baseUrl/cart?clientId=$clientId'))
          .timeout(const Duration(seconds: 10));

      print("🔵 [API] Statut HTTP: ${response.statusCode}");

      if ((response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) &&
          response.body.isNotEmpty) {
        List<dynamic> data = json.decode(response.body);
        List<CartItem> cartItems = data.map((item) => CartItem.fromJson(item)).toList();

        print("✅ [API] Panier récupéré avec succès : ${cartItems.length} articles");
        return cartItems;
      } else {
        print("❌ [API] Erreur - Statut ${response.statusCode}");
        throw Exception("Erreur API : Statut ${response.statusCode}");
      }
    } catch (e) {
      print("❌ [API] Erreur lors de la récupération du panier : $e");
      throw Exception("Erreur réseau");
    }
  }

  // 🔄 Mettre à jour le panier côté serveur
  static Future<void> updateCart(int clientId, List<CartItem> cartItems) async {
    try {
      print("📡 [API] Mise à jour du panier pour client ID: $clientId...");

      final response = await http.post(
        Uri.parse('$baseUrl/cart/update'),
        body: json.encode({
          "clientId": clientId,
          "items": cartItems.map((item) => item.toJson()).toList(),
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
        print("✅ [API] Panier mis à jour avec succès !");
      } else {
        print("❌ [API] Erreur mise à jour panier : ${response.body}");
        throw Exception("Erreur lors de la mise à jour du panier");
      }
    } catch (e) {
      print("❌ [API] Erreur réseau : $e");
      throw Exception("Erreur réseau");
    }
  }

  // 🗑️ Supprimer un article du panier côté serveur
  static Future<void> removeFromCart(int clientId, int productId) async {
    try {
      print("📡 [API] Suppression du produit ID: $productId du panier...");

      final response = await http.delete(
        Uri.parse('$baseUrl/cart/remove'),
        body: json.encode({
          "clientId": clientId,
          "productId": productId,
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
        print("✅ [API] Produit supprimé avec succès !");
      } else {
        print("❌ [API] Erreur suppression produit : ${response.body}");
      }
    } catch (e) {
      print("❌ [API] Erreur réseau : $e");
    }
  }

  // 🗑️ Vider complètement le panier côté serveur
  static Future<void> clearCart(int clientId) async {
    try {
      print("📡 [API] Vidage du panier pour client ID: $clientId...");

      final response = await http.delete(
        Uri.parse('$baseUrl/cart/clear/$clientId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
        print("✅ [API] Panier vidé avec succès !");
      } else {
        print("❌ [API] Erreur lors du vidage du panier : ${response.body}");
      }
    } catch (e) {
      print("❌ [API] Erreur réseau : $e");
    }
  }

  // 🔑 Connexion utilisateur et stockage du token
  static Future<bool> login(String email, String password) async {
    try {
      print("📡 [API] Connexion en cours...");

      final response = await http.post(
        Uri.parse('$baseUrl/account/signin'),
        body: json.encode({'mail': email, 'password': password}),
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
      );

      print("📥 [API] Réponse reçue : ${response.body}");

      if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
        final data = json.decode(response.body);
        final token = data['token'];
        final clientId = data['clientId'];

        print("✅ [API] Connexion réussie - Token: $token, ClientID: $clientId");

        if (token == null || clientId == null) {
          print('❌ [API] Erreur : Réponse invalide (token ou clientId null)');
          throw Exception("Réponse invalide du serveur");
        }

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString('clientId', clientId.toString());

        print("📝 [API] Token stocké avec succès !");
        return true;
      } else {
        print('❌ [API] Échec de la connexion. Code erreur: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('❌ [API] Erreur de connexion : $e');
      return false;
    }
  }

  // 📝 Fonction d'inscription (Register)
  static Future<String> register(String name, String email, String password) async {
    final url = Uri.parse('$baseUrl/account/signup');
    final body = json.encode({
      'username': name,
      'mail': email,
      'password': password,
    });

    print('📡 [API] Envoi de la requête : POST $url');
    print('📤 [API] Données envoyées : $body');

    final response = await http.post(
      url,
      body: body,
      headers: {'Content-Type': 'application/json'},
    );

    print('🔵 [API] Statut HTTP: ${response.statusCode}');
    print('📥 [API] Réponse API: ${response.body}');

    switch (response.statusCode) {
      case HttpStatus.created:
      case HttpStatus.ok:
        return "✅ Inscription réussie !";

      case HttpStatus.badRequest:
        return "⚠️ Requête invalide. Vérifiez vos informations.";

      case HttpStatus.conflict:
        return "⚠️ L'utilisateur existe déjà. Essayez un autre email.";

      case HttpStatus.internalServerError:
        return "❌ Erreur serveur. Réessayez plus tard.";

      default:
        return "❌ Une erreur est survenue. Code: ${response.statusCode}";
    }
  }

  // 📌 Fonction de gestion des erreurs API
  static String _handleError(http.Response response) {
    try {
      final errorData = json.decode(response.body);
      return errorData['message'] ?? "❌ Erreur inconnue";
    } catch (e) {
      return "❌ Erreur inconnue (Code ${response.statusCode})";
    }
  }
}