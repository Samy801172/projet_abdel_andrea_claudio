// Appel vers l'APi pour la gestion des données

import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/config.dart';

class ApiService {
  // Utilisez l'URL de base définie dans votre fichier config.dart
  static const String baseUrl = Config.baseUrl;

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
      Uri.parse('$baseUrl/account/signup'),
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


  // Méthode pour la connexion
  static Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/account/signin'),
        body: json.encode({'email': email, 'password': password}),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        // Connexion réussie, on peut stocker le token ici si besoin
        return true;
      } else {
        print('Échec de la connexion. Code erreur: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('Erreur de connexion : $e');
      return false;
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