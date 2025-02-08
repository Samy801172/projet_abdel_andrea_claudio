// Page principal - Menu + promotions du moment, derniers médicaments + login

import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/Design/BaseLayout.dart';
import '../Widgets/ProductsList.dart';

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  // Variable pour stocker le texte de la recherche
  String searchQuery = '';

  @override
  Widget build(BuildContext context) {
    return BaseLayout(
      title: 'GohanMedic',
      requireAuthentication: false, //accessible sans connexion
      body: Column(
        children: [
          // Barre de recherche
          Padding(
            padding: const EdgeInsets.all(10.0),
            child: TextField(
              onChanged: (value) {
                // Met à jour la recherche (ajoutez une gestion de l'état si nécessaire)
              },
              decoration: InputDecoration(
                labelText: "Rechercher un produit",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),
          // Liste des produits
          Expanded(
            child: ProductsList(searchQuery: ''), // Passez ici le filtre
          ),
        ],
      ),
    );
  }
}