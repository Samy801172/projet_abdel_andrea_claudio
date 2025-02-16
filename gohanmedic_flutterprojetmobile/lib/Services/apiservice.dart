// 📡 Service d'appel à l'API pour gérer les données et la communication avec le backend

import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/config.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/HttpStatus.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/CartItem.dart';

import '../Provider/AuthentificationProvider.dart';

class ApiService {
  // 🌍 URL de base pour l'API
  static const String baseUrl = Config.apiUrl;

  // 🔄 Fonction pour rafraîchir le token
  static Future<bool> refreshToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? refreshToken = prefs.getString('refreshToken');

    if (refreshToken == null) {
      print("❌ Aucun refresh token trouvé !");
      return false;
    }

    try {
      print("📡 [API] Rafraîchissement du token...");
      final response = await http.post(
        Uri.parse('$baseUrl/account/refresh'),
        body: json.encode({"refresh": refreshToken}),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
        final data = json.decode(response.body);
        String newAccessToken = data['token'];
        String newRefreshToken = data['refreshToken'];

        await prefs.setString('token', newAccessToken);
        await prefs.setString('refreshToken', newRefreshToken);

        print("✅ [API] Token rafraîchi avec succès !");
        return true;
      } else {
        print("❌ [API] Erreur lors du refresh token : ${response.body}");
        return false;
      }
    } catch (e) {
      print("❌ [API] Erreur réseau lors du refresh token : $e");
      return false;
    }
  }

  // 🔑 Vérification et récupération du token valide
  static Future<String?> getValidToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('token');

    if (token == null) {
      print("🔄 Aucun token trouvé, tentative de refresh...");
      bool refreshed = await refreshToken();
      if (!refreshed) return null;
      token = prefs.getString('token');
    }
    return token;
  }

  // 🛒 Récupérer le panier du client
  static Future<List<CartItem>> fetchCart(int clientId) async {
    try {
      String? token = await getValidToken();
      if (token == null) return [];

      final response = await http.get(
        Uri.parse('$baseUrl/cart?clientId=$clientId'),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
      );

      if (response.statusCode == HttpStatus.ok) {
        List<dynamic> data = json.decode(response.body);
        return data.map((item) => CartItem.fromJson(item)).toList();
      } else if (response.statusCode == HttpStatus.unauthorized) {
        print("🔄 Token expiré, tentative de refresh...");
        bool refreshed = await refreshToken();
        if (refreshed) return fetchCart(clientId);
      }
      throw Exception("Erreur API : ${response.statusCode}");
    } catch (e) {
      throw Exception("Erreur réseau");
    }
  }

  // 🔄 Récupérer les produits
  static Future<List<dynamic>> fetchProducts() async {
    try {
      print("📡 [API] Récupération des produits...");

      final response = await http.get(
        Uri.parse('$baseUrl/products'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
        return json.decode(response.body);
      }
      throw Exception("Erreur API : ${response.statusCode}");
    } catch (e) {
      throw Exception("Erreur réseau");
    }
  }

  // 🛒 Ajouter un produit au panier côté API
  static Future<void> addToCart(int clientId, int productId, int quantity) async {
    try {
      String? token = await getValidToken();
      if (token == null) throw Exception("Utilisateur non authentifié");

      print("📡 [API] Ajout au panier - Produit ID: $productId, Quantité: $quantity");

      final response = await http.post(
        Uri.parse('$baseUrl/cart'),
        body: json.encode({
          "clientId": clientId,
          "productId": productId,
          "quantity": quantity,
        }),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
        print("✅ [API] Produit ajouté au panier avec succès !");
      } else {
        print("❌ [API] Erreur lors de l'ajout au panier : ${response.body}");
        throw Exception("Erreur API : ${response.body}");
      }
    } catch (e) {
      print("❌ [API] Erreur réseau lors de l'ajout au panier : $e");
      throw Exception("Erreur réseau");
    }
  }

  // 🛒 Mettre à jour le panier
  static Future<void> updateCart(int clientId, int cartItemId, int quantity) async {
    try {
      String? token = await getValidToken();
      if (token == null) throw Exception("Utilisateur non authentifié");

      print("📡 [API] Mise à jour du panier - Produit ID: $cartItemId, Nouvelle Quantité: $quantity");

      final response = await http.put(
        Uri.parse('$baseUrl/cart/$cartItemId/quantity'),
        body: json.encode({"clientId": clientId, "quantity": quantity}),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
      );

      if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
        print("✅ [API] Quantité mise à jour !");
      } else {
        print("❌ [API] Erreur lors de la mise à jour : ${response.body}");
        throw Exception("Erreur API : ${response.body}");
      }
    } catch (e) {
      print("❌ [API] Erreur réseau : $e");
      throw Exception("Erreur réseau");
    }
  }

  // 🔑 Connexion utilisateur
  static Future<bool> login(String email, String password) async {
    try {
      print("📡 [API] Connexion en cours...");

      final response = await http.post(
        Uri.parse('$baseUrl/account/signin'),
        body: json.encode({'mail': email, 'password': password}),
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);

        // 📥 Enregistrer les infos dans SharedPreferences
        SharedPreferences prefs = await SharedPreferences.getInstance();

        await prefs.setString('token', data['token']);
        await prefs.setString('refreshToken', data['refreshToken']);
        await prefs.setString('clientId', data['clientId'].toString());
        await prefs.setString('userEmail', data['credential']['mail']);

        // ✅ Afficher les valeurs enregistrées pour debug
        print("✅ [API] Connexion réussie !");
        print("🔑 Token enregistré : ${prefs.getString('token')}");
        print("🆔 Client ID enregistré : ${prefs.getString('clientId')}");
        print("📧 Email enregistré : ${prefs.getString('userEmail')}");

        return true;
      } else {
        print("❌ [API] Échec de connexion : ${response.body}");
        return false;
      }
    } catch (e) {
      print("❌ [API] Erreur de connexion : $e");
      return false;
    }
  }

  // 🔄 Fonction d'inscription (Register)
  static Future<String> register(String name, String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/account/signup'),
        body: json.encode({
          'username': name,
          'mail': email,
          'password': password,
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == HttpStatus.created || response.statusCode == HttpStatus.ok) {
        return "✅ Inscription réussie !";
      } else {
        return "❌ Erreur lors de l'inscription : ${response.body}";
      }
    } catch (e) {
      return "❌ Erreur réseau : $e";
    }
  }

  // 🆔 Récupérer le profil utilisateur
  static Future<Map<String, dynamic>?> fetchProfile() async {
    try {
      // 🔑 Récupérer le token et le client ID stockés
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      String? clientId = prefs.getString('clientId');

      if (token == null || clientId == null) {
        print("❌ [API] Erreur: Aucun token ou clientId trouvé !");
        return null;
      }

      print("📡 [API] Récupération du profil de l'utilisateur $clientId...");

      final response = await http.get(
        Uri.parse('$baseUrl/clients/profile/$clientId'),
        headers: {
          'Authorization': 'Bearer $token', // ✅ Ajout du token
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print("✅ [API] Profil récupéré avec succès : $data");
        return data; // Retourne les données du profil
      }

      // 🔄 Gestion du token expiré (401 Unauthorized)
      else if (response.statusCode == 401) {
        print("🔄 [API] Token expiré, tentative de rafraîchissement...");

        bool refreshed = await refreshToken();

        if (refreshed) {
          print(
              "✅ [API] Token rafraîchi avec succès, nouvelle tentative de récupération du profil...");
          return fetchProfile(); // 🔁 Relance la requête après refresh
        } else {
          print("❌ [API] Impossible de rafraîchir le token. Déconnexion nécessaire.");
          await AuthentificationProvider().logout(); // 🚀 Déconnexion automatique
          return null;
        }
      }
      // ❌ Autres erreurs API
      else {
        print("❌ [API] Erreur lors de la récupération du profil: ${response.body}");
        return null;
      }
    } catch (e) {
      print("❌ [API] Erreur réseau ou exception lors de la récupération du profil: $e");
      return null;
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
}