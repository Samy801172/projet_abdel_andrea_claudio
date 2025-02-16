// Permet l'authentification et de faire le lien avec l'API
// pour permettre de charger des informations

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/apiservice.dart';

class AuthentificationProvider with ChangeNotifier {
  String? _clientId;
  String? _token;
  String? _userEmail;
  bool _isAuthenticated = false;

  String? get clientId => _clientId;
  String? get token => _token;
  String? get userEmail => _userEmail;

  bool get isAuthenticated => _isAuthenticated;

  AuthentificationProvider() {
    loadUser();
  }

  // 📡 **Charger les infos utilisateur stockées localement**
  Future<void> loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    // 🔄 Vérifier si les valeurs sont bien stockées
    print("🔑 [DEBUG] Token stocké : ${prefs.getString('token')}");
    print("🆔 [DEBUG] Client ID stocké : ${prefs.getString('clientId')}");

    _clientId = prefs.getString('clientId');
    _token = prefs.getString('token');
    _userEmail = prefs.getString('userEmail');

    // 🔄 Convertir `clientId` en `int`
    int? parsedClientId = _clientId != null ? int.tryParse(_clientId!) : null;

    print('🔍 [DEBUG] Chargement utilisateur : Token=$_token, ID=$_clientId');

    _isAuthenticated = (_token != null && parsedClientId != null);
    notifyListeners();
  }

  // 🔑 **Connexion utilisateur avec stockage des infos**
  Future<bool> login(String email, String password) async {
    try {
      print("📡 [API] Connexion avec mail: $email");

      bool success = await ApiService.login(email, password);

      if (success) {
        await loadUser(); // Recharge les infos après connexion
        print("✅ Connexion réussie : Client ID=$_clientId, Token=$_token");

        final prefs = await SharedPreferences.getInstance();
        _clientId = prefs.getString('clientId');
        _token = prefs.getString('token');
        _userEmail = prefs.getString('userEmail');

        print("✅ [DEBUG] Données après connexion:");
        print("🔑 Token: ${prefs.getString('token')}");
        print("🆔 Client ID: ${prefs.getString('clientId')}");
        print("📧 Email: ${prefs.getString('userEmail')}");

        _isAuthenticated = (_token != null && _clientId != null);
        notifyListeners();

        return true;
      } else {
        print("❌ Échec de connexion : Mauvais identifiants");
        return false;
      }
    } catch (e) {
      print('❌ Erreur de connexion : $e');
      return false;
    }
  }

  // 📝 **Inscription utilisateur**
  Future<String> register(String name, String email, String password) async {
    try {
      return await ApiService.register(name, email, password);
    } catch (e) {
      print('❌ Erreur d\'inscription : $e');
      throw Exception("Une erreur est survenue. Veuillez réessayer.");
    }
  }

  // ✅ **Vérifier si l'utilisateur est connecté**
  bool isUserLoggedIn() {
    return _clientId != null && _clientId!.isNotEmpty && _token != null;
  }

  // 🔄 **Déconnexion**
  Future<void> logout() async {
    try {
      // 📦 **Efface les données utilisateur**
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('clientId');
      await prefs.remove('token');
      await prefs.remove('userEmail');

      _clientId = null;
      _token = null;
      _userEmail = null;
      _isAuthenticated = false;

      print("🔴 Utilisateur déconnecté avec succès.");
      notifyListeners();
    } catch (error) {
      print("❌ Erreur lors de la déconnexion : $error");
    }
  }

  // 🛑 **Confirmation avant déconnexion**
  Future<bool> confirmLogout(BuildContext context) async {
    return await showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("Déconnexion"),
          content: const Text("Voulez-vous vraiment vous déconnecter ?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false), // Annuler
              child: const Text("Annuler"),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true), // Confirmer
              child: const Text("Oui", style: TextStyle(color: Colors.red)),
            ),
          ],
        );
      },
    );
  }
}