import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/apiservice.dart'; // Assurez-vous que ApiService est bien importé

class AuthentificationProvider with ChangeNotifier {
  String? _clientId;
  String? _token;
  String? _userEmail;
  bool _isAuthenticated = false; // Variable privée pour suivre l'état de connexion

  String? get clientId => _clientId;
  String? get token => _token;
  String? get userEmail => _userEmail;

  bool get isAuthenticated => _token != null && _clientId != null; // permet de vérifier si un utilisateur est connecté

  AuthentificationProvider() {
    loadUser();
  }

  // Récupérer les infos utilisateur depuis le stockage local
  Future<void> loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    _clientId = prefs.getString('clientId');
    _token = prefs.getString('token');
    _userEmail = prefs.getString('userEmail');

    print('🔍 Chargement utilisateur : Token=$_token, ID=$_clientId');

    // Vérifie si les données sont valides
    // Met à jour l'état d'authentification
    _isAuthenticated = (_token != null && _clientId != null);// Définit l'utilisateur comme connecté

    notifyListeners(); // Met à jour les widgets dépendants
  }

  // Connexion via ApiService
  Future<bool> login(String email, String password) async {
    try {
      bool success = await ApiService.login(email, password);

      if (success) {
        // Si la connexion réussit, recharger les infos utilisateur
        await loadUser(); // Recharge les données après connexion
        notifyListeners();
        return true;
      } else {
        print("Échec de connexion : mauvais identifiants");
        return false; // Ajouté pour bien signaler l'échec
      }
    } catch (e) {
      // Si une exception est lancée lors de l'appel API ou autre erreur
      print('Erreur de connexion : $e');
      return false; // Ajouté pour éviter une exception
    }
  }

  // Inscription via ApiService
  Future<String> register(String name, String email, String password) async {
    try {
      return await ApiService.register(name, email, password);
    } catch (e) {
      print('Erreur d\'inscription : $e');
      throw Exception("Une erreur est survenue. Veuillez réessayer.");
    }
  }

  // Vérifie si un utilisateur est connecté
  bool isUserLoggedIn() {
    return _clientId != null && _token != null;
  }

  // Déconnexion
  Future<void> logout() async {
    try {
      _clientId = null;
      _token = null;
      _userEmail = null;
      _isAuthenticated = false; // Marque l'utilisateur comme déconnecté

      // Supprime uniquement les données liées à l'utilisateur
      SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.remove('clientId');
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