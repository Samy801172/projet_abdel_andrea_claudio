import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/apiservice.dart'; // Assurez-vous que ApiService est bien importé

class AuthentificationProvider with ChangeNotifier {
  String? _userId;
  String? _token;
  String? _userEmail;

  String? get userId => _userId;
  String? get token => _token;
  String? get userEmail => _userEmail;

  bool get isAuthenticated => _token != null; // permet de vérifier si un utilisateur est connecté

  AuthentificationProvider() {
    loadUser();
  }

  // Récupérer les infos utilisateur depuis le stockage local
  Future<void> loadUser() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    _userId = prefs.getString('userId');
    _token = prefs.getString('token');
    _userEmail = prefs.getString('userEmail');
    notifyListeners();
  }

  // Connexion via ApiService
  Future<bool> login(String email, String password) async {
    try {
      bool success = await ApiService.login(email, password);

      if (success) {
        // Si la connexion réussit, recharger les infos utilisateur
        await loadUser();
        notifyListeners();
        return true;
      } else {
        // Si l'API retourne une erreur (connexion échouée)
        throw Exception("Échec de la connexion. Vérifiez vos identifiants.");
      }
    } catch (e) {
      // Si une exception est lancée lors de l'appel API ou autre erreur
      print('Erreur de connexion : $e');
      throw Exception("Une erreur est survenue. Veuillez réessayer.");
    }
  }

  // Inscription via ApiService
  Future<bool> register(String name, String email, String password) async {
    try {
      bool success = await ApiService.register(name, email, password);

      if (success) {
        return true; // Inscription réussie
      } else {
        throw Exception("Erreur lors de l'inscription.");
      }
    } catch (e) {
      print('Erreur d\'inscription : $e');
      throw Exception("Une erreur est survenue. Veuillez réessayer.");
    }
  }

  // Vérifie si un utilisateur est connecté
  bool isUserLoggedIn() {
    return _userId != null && _token != null;
  }

  // Déconnexion
  Future<void> logout() async {
    try {
      _userId = null;
      _token = null;
      _userEmail = null;

      // Supprime uniquement les données liées à l'utilisateur
      SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.remove('userId');
      await prefs.remove('token');
      await prefs.remove('userEmail');

      print("Utilisateur déconnecté.");

      notifyListeners();
    } catch (error) {
      print("Erreur lors de la déconnexion : $error");
    }
  }

  Future<bool> confirmLogout(BuildContext context) async {
    return await showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("Déconnexion"),
          content: const Text("Voulez-vous vraiment vous déconnecter ?"),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(false); // Annuler
              },
              child: const Text("Annuler"),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(true); // Confirmer
              },
              child: const Text("Oui", style: TextStyle(color: Colors.red)),
            ),
          ],
        );
      },
    );
  }
}