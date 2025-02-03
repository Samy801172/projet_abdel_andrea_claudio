// Appel vers l'APi pour la gestion des données

import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  // static const String baseUrl = 'http://localhost:2024/api'; // => TEST SUR PC EN LOCAL
  // static const String _baseUrl = "http://192.168.0.162:2024/api"; // => TEST SUR UN SMARTPHONE CONNECTE
  static const String baseUrl = 'http://10.0.2.2:2024/api'; // => TEST SUR EMULATEUR ANDROID

  // Fonction pour la liste des médicaments (Products)
  static Future<List<dynamic>> fetchProducts() async {
    final response = await http.get(Uri.parse('$baseUrl/products'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Erreur de chargement de produit');
    }
  }

  // Fonction d'inscription (Register)
  static Future<bool> register(String name, String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/register'),
      body: json.encode({
        'name': name,
        'email': email,
        'password': password,
      }),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 201) {
      return true; // Succès de l'inscription
    } else {
      return false; // Échec de l'inscription
    }
  }

  // Fonction de connexion (Login)
  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse("$baseUrl/login"),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {'success': true, 'token': data['token'], 'userId': data['userId']};
      } else {
        return {'success': false, 'message': _handleError(response)};
      }
    } catch (error) {
      return {'success': false, 'message': "Erreur de connexion au serveur"};
    }
  }

  // Fonction de récupération des erreurs API
  static String _handleError(http.Response response) {
    try {
      final errorData = json.decode(response.body);
      return errorData['message'] ?? "Erreur inconnue";
    } catch (e) {
      return "Erreur inconnue (Code ${response.statusCode})";
    }
  }
}