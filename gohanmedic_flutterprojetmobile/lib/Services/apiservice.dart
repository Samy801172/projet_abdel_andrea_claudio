// Appel vers l'APi pour la gestion des données

import 'dart:async';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/config.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/HttpStatus.dart';

class ApiService {
  // Utilisez l'URL de base définie dans votre fichier config.dart
  static const String baseUrl = Config.apiUrl;

  // Fonction pour récupérer la liste des produits depuis l'API et stock les infos
  static Future<List<dynamic>> fetchProducts() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/products'))
          .timeout(const Duration(seconds: 10)); // Timeout de 10 secondes

      if (response.statusCode == HttpStatus.ok && response.body.isNotEmpty) {
        final List<dynamic> data = json.decode(response.body);
        return data; // Retourne directement les produits
      } else {
        throw Exception('Erreur: Réponse vide ou statut ${response.statusCode == HttpStatus.notFound}');
      }
    } on http.ClientException catch (e) {
      print(" Erreur réseau : $e");
      throw Exception("Erreur réseau");
    } on TimeoutException {
      print(" Temps d’attente dépassé : L’API ne répond pas");
      throw Exception("Temps d’attente dépassé");
    } catch (e) {
      print(" Erreur inconnue : $e");
      throw Exception("Erreur inconnue");
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

    if (response.statusCode == HttpStatus.created) {
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
        body: json.encode({'mail': email, 'password': password}),
        headers: {'Content-Type': 'application/json; charset=UTF-8'}
      );

      print("📤 Envoi des données : ${json.encode({'mail': email, 'password': password})}");
      print("📥 Réponse de l'API : ${response.body}");
      print("📋 Headers: ${response.headers}");
      print("📥 Statut de l'API : ${response.statusCode}");


      // Si connexion réussie, on peut stocker le token
      if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
        final data = json.decode(response.body);
        final token = data['token'];
        final clientId = data['clientId'];

        print("✅ JSON décodé avec succès : $data");
        print("🔍 Vérification des données API -> Token: $token, ClientID: $clientId");

        if (token == null || clientId == null) {
          print('Erreur API : Réponse invalide (token ou clientId null)');
          throw Exception("Réponse invalide du serveur");
        }

        // Sauvegarde le token et l'identifiant utilisateur
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString('clientId', clientId.toString());

        print("📝 Vérification stockage : Token=$token, ClientID=${clientId.toString()}");

        return true; // Connexion réussie
      } else {
        print('Échec de la connexion. Code erreur: ${response.statusCode}');
        throw Exception('Erreur de connexion : ${_handleError(response)}');
      }
    } catch (e) {
      print('Erreur de connexion : $e');
      throw Exception("Erreur de connexion");
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