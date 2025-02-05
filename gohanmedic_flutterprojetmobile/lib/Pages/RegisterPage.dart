import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/AuthentificationProvider.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/Design/BaseLayout.dart';
import 'package:http/http.dart' as http;
import 'package:gohanmedic_flutterprojetmobile/Services/apiservice.dart';
import 'package:provider/provider.dart';

class RegisterPage extends StatefulWidget {
  @override
  _RegisterPageState createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>(); // Clé pour la validation du formulaire
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();

  bool _isPasswordVisible = false; // Pour afficher/masquer le mot de passe
  bool _isConfirmPasswordVisible = false;  // Gère l'affichage du champ confirmation

  // Récupère le Provider d'authentification


  // Fonction pour gérer l'inscription du client
  Future<void> _register() async {
    if (_formKey.currentState!.validate()) { // Vérifie si le formulaire est valide
      // Récupère le Provider d'authentification
      final authProvider = Provider.of<AuthentificationProvider>(context, listen: false);

      bool success = await authProvider.register(
        _nameController.text,
        _emailController.text,
        _passwordController.text,
      );

      if (success) {
        // Si l'inscription réussit, rediriger vers la page de connexion
        Navigator.pushReplacementNamed(context, '/login');
      } else {
        // Afficher une erreur si l'inscription échoue
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Échec de l’inscription. Veuillez réessayer.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return BaseLayout(
        title: "Inscription",
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey, // Associe la clé de validation au formulaire
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Champ Nom complet
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'Nom complet',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Veuillez entrer votre nom complet.";
                  }
                  return null;
                },
              ),
              SizedBox(height: 10),

              // Champ Email
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Veuillez entrer un email.";
                  }
                  if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value)) {
                    return "Email invalide.";
                  }
                  return null;
                },
              ),
              SizedBox(height: 10),

              // Champ Mot de passe
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Mot de passe',
                  border: OutlineInputBorder(),
                  suffixIcon: IconButton(
                    icon: Icon(_isPasswordVisible ? Icons.visibility : Icons.visibility_off),
                    onPressed: () {
                      setState(() {
                        _isPasswordVisible = !_isPasswordVisible;
                      });
                    },
                  ),
                ),
                obscureText: !_isPasswordVisible,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Veuillez entrer un mot de passe.";
                  }
                  if (value.length < 6) {
                    return "Le mot de passe doit contenir au moins 6 caractères.";
                  }
                  return null;
                },
              ),
              SizedBox(height: 10),

              // Champ Confirmation du mot de passe
              TextFormField(
                controller: _confirmPasswordController,
                decoration: InputDecoration(
                  labelText: 'Confirmer le mot de passe',
                  border: OutlineInputBorder(),
                  suffixIcon: IconButton(
                    icon: Icon(_isConfirmPasswordVisible ? Icons.visibility : Icons.visibility_off),
                    onPressed: () {
                      setState(() {
                        _isConfirmPasswordVisible = !_isConfirmPasswordVisible;
                      });
                    },
                  ),
                ),
                obscureText: !_isConfirmPasswordVisible,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Veuillez confirmer votre mot de passe.";
                  }
                  if (value != _passwordController.text) {
                    return "Les mots de passe ne correspondent pas.";
                  }
                  return null;
                },
              ),
              SizedBox(height: 20),

              // Bouton S'inscrire
              ElevatedButton(
                onPressed: _register,
                child: Text("S'inscrire"),
              ),

              // Bouton pour aller à la page de connexion
              TextButton(
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/login');
                },
                child: Text("Déjà un compte ? Se connecter"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}