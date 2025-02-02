//Page de login pour le client + lient vers la page inscription

import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:gohanmedic_flutterprojetmobile/Provider/AuthentificationProvider.dart';
import 'package:provider/provider.dart';

class LoginPage extends StatelessWidget {
  final TextEditingController emailController = TextEditingController(); // utilisé pour récupérer les valeurs encodées
  final TextEditingController passwordController = TextEditingController(); // utilisé pour récupérer les valeurs encodées

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Connexion'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: emailController,
              decoration: InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 10),
            TextField(
              controller: passwordController,
              decoration: InputDecoration(
                labelText: 'Mot de passe',
                border: OutlineInputBorder(),
              ),
              obscureText: true,
            ),
            SizedBox(height: 20),

            // Bouton de connexion
            ElevatedButton(
              onPressed: () async {
                final authentificationProvider = Provider.of<AuthentificationProvider>(context, listen: false);

                // Connexion via AuthProvider qui vérifie ce qu'il y a encodé avec l'API
                bool success = await authentificationProvider.login(
                emailController.text,
                passwordController.text,
              );

                if (success) {
                  // Rediriger vers la page d'accueil si la connexion réussit
                  Navigator.pushReplacementNamed(context, '/home');
                } else {
                  // Afficher un message d'erreur si la connexion échoue
                  ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text("Échec de la connexion. Vérifiez vos identifiants.")),
                );
              }
            },
              child: Text('Se connecter'),
            ),

            // Lien vers la page d'inscription
            TextButton(
              onPressed: () {
                Navigator.pushNamed(context, '/register');
              },
              child: Text("S'inscrire"),
            ),
          ],
        ),
      ),
    );
  }
}