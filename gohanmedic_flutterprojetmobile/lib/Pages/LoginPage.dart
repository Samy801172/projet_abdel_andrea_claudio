//Page de login pour le client + lient vers la page inscription

import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/Design/BaseLayout.dart';
import 'package:provider/provider.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/AuthentificationProvider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  // Contrôleurs pour récupérer les valeurs entrées par l'utilisateur
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  // Variable pour indiquer si une requête est en cours
  bool _isLoading = false;

  // Fonction qui gère la connexion de l'utilisateur
  Future<void> _login() async {
    // Vérifie si les champs ne sont pas vides
    if (emailController.text.isEmpty || passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Veuillez remplir tous les champs.")),
      );
      return;
    }

    setState(() {
      _isLoading = true; // Active l'indicateur de chargement
    });

    // Récupère le Provider d'authentification
    final authProvider = Provider.of<AuthentificationProvider>(context, listen: false);

    try {
      // Appel de la fonction de connexion via le provider
      bool success = await authProvider.login(
        emailController.text,
        passwordController.text,
      );

      setState(() {
        _isLoading = false; // Désactive l'indicateur de chargement
      });

      if (success) {
        print("✅ Connexion réussie !");
        // 🔥 Vérifier immédiatement si `clientId` et `token` ont bien été stockés
        checkStoredData();
        // Redirection vers la page d'accueil après une connexion réussie
        Navigator.pushReplacementNamed(context, '/home');
      }else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Identifiants incorrects. Veuillez réessayer.")),
        );
      }
    } catch (error) {
      setState(() {
        _isLoading = false; // Désactive l'indicateur de chargement
      });
      // Affiche un message d'erreur si la connexion échoue
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())), // Affiche le message d'erreur reçu du provider
      );
    }
  }

  Future<void> checkStoredData() async {
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString('token');
    String? clientId = prefs.getString('clientId');

    print("🛠️ Vérification stockage : Token=$token, ClientID=$clientId");

    if (clientId == null || clientId == "null") {
      print("⚠️ `clientId` n'est pas enregistré ou est `null` !");
    }
  }

  @override
  Widget build(BuildContext context) {
    return BaseLayout(
      title: 'Connexion',
      requireAuthentication: false, //accessible sans connexion
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Champ Email
            TextField(
              controller: emailController,
              decoration: InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress, // Utilise le clavier email
            ),
            SizedBox(height: 10),

            // Champ Mot de passe
            TextField(
              controller: passwordController,
              decoration: InputDecoration(
                labelText: 'Mot de passe',
                border: OutlineInputBorder(),
              ),
              obscureText: true, // Cache le mot de passe
            ),
            SizedBox(height: 20),

            // Bouton de connexion avec indicateur de chargement
            _isLoading
                ? CircularProgressIndicator() // Affiche un loader pendant la requête
                : ElevatedButton(
              onPressed: _login, // Appelle la fonction _login()
              child: Text('Se connecter'),
            ),

            // Lien vers la page d'inscription
            TextButton(
              onPressed: () {
                Navigator.pushNamed(context, '/register'); // Redirige vers la page d'inscription
              },
              child: Text("Pas encore de compte ? S'inscrire"),
            ),
          ],
        ),
      ),
    );
  }
}