import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/env.dart';
import 'dart:io';

class AuthService {
  static const String tokenKey = 'auth_token';
  static const String clientIdKey = 'client_id';

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final url = '${Env.apiUrl}${Env.loginEndpoint}';
      print('Tentative de connexion à : $url');
      
      final body = jsonEncode({
        'mail': email,
        'password': password,
      });
      print('Body envoyé : $body');

      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: body,
      );

      print('Status code reçu : ${response.statusCode}');
      print('Headers reçus : ${response.headers}');
      print('Body reçu : ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        
        // Sauvegarder le token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(Env.tokenKey, data['token']);
        if (data['refreshToken'] != null) {
          await prefs.setString(Env.refreshTokenKey, data['refreshToken']);
        }
        
        return data;
      } else {
        throw Exception('Erreur ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      print('Erreur détaillée : $e');
      throw Exception('Erreur de connexion au serveur : $e');
    }
  }

  Future<bool> isAuthenticated() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(Env.tokenKey);
    if (token == null) return false;

    try {
      final response = await http.get(
        Uri.parse('${Env.apiUrl}${Env.meEndpoint}'),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
        },
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(Env.tokenKey);
    await prefs.remove(Env.refreshTokenKey);
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(tokenKey);
  }

  Future<String?> getClientId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(clientIdKey);
  }
} 