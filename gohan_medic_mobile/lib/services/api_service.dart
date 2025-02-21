import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/product.dart';
import '../models/auth_response.dart';

class ApiService {
  final String baseUrl = 'http://localhost:2024/api'; // Votre URL backend

  // Authentification
  Future<AuthResponse> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/account/signin'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'mail': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final auth = AuthResponse.fromJson(data);
        
        // Sauvegarder le token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', auth.accessToken);
        
        return auth;
      } else {
        throw Exception('Échec de la connexion');
      }
    } catch (e) {
      throw Exception('Erreur de connexion: $e');
    }
  }

  // Récupérer les produits avec authentification
  Future<List<Product>> getProducts() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('$baseUrl/products'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );
      
      if (response.statusCode == 200) {
        List<dynamic> data = json.decode(response.body);
        return data.map((json) => Product.fromJson(json)).toList();
      } else {
        throw Exception('Erreur de chargement des produits');
      }
    } catch (e) {
      throw Exception('Erreur de connexion au serveur');
    }
  }

  // Ajouter au panier
  Future<void> addToCart(int productId, int quantity) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      final response = await http.post(
        Uri.parse('$baseUrl/cart'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'productId': productId,
          'quantity': quantity,
        }),
      );

      if (response.statusCode != 201) {
        throw Exception('Erreur lors de l\'ajout au panier');
      }
    } catch (e) {
      throw Exception('Erreur de connexion au serveur');
    }
  }
} 