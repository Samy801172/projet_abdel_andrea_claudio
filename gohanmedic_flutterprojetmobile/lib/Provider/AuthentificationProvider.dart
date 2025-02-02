// Stocker et gérer les données de l'utilisateur

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AuthentificationProvider with ChangeNotifier {
  String? _userId;
  String? _token;
  String? _userEmail;

  String? get userId => _userId;
  String? get token => _token;
  String? get userEmail => _userEmail;

  bool get isAuthenticated => _token != null;

  // Récupérer les infos utilisateur depuis le stockage local
  Future<void> loadUser() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    _userId = prefs.getString('userId');
    _token = prefs.getString('token');
    _userEmail = prefs.getString('userEmail');
    notifyListeners();
  }

  // Connexion via API
  Future<bool> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('http://ton-serveur-api.com/login'),
      body: json.encode({'email': email, 'password': password}),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      _userId = data['userId'];
      _token = data['token'];
      _userEmail = email;

      // Sauvegarde dans SharedPreferences
      SharedPreferences prefs = await SharedPreferences.getInstance();
      prefs.setString('userId', _userId!);
      prefs.setString('token', _token!);
      prefs.setString('userEmail', _userEmail!);

      notifyListeners();
      return true;
    }
    return false;
  }

  // Déconnexion
  Future<void> logout() async {
    _userId = null;
    _token = null;
    _userEmail = null;

    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    notifyListeners();
  }
}
