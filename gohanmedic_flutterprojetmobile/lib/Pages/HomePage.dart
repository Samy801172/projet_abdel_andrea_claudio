import 'package:flutter/material.dart';
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
    return Scaffold(
      appBar: AppBar(
        title: Text('GohanMedic'),
      ),

      // Menu latéral (Drawer) avec navigation vers d'autres pages
      drawer: Drawer(
        child: ListView( // utilisé pour afficher la liste des produits
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(
                color: Colors.green[700], // Fond vert pour le header du menu
              ),
              child: Text(
                'Menu',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                ),
              ),
            ),
            ListTile(
              leading: Icon(Icons.shopping_cart, color: Colors.green[800]),
              title: Text('Panier'),
              onTap: () {
                Navigator.pushNamed(context, '/cart'); // Navigation vers la page panier
              },
            ),
            ListTile(
              leading: Icon(Icons.person, color: Colors.green[800]),
              title: Text('Profil'),
              onTap: () {
                Navigator.pushNamed(context, '/profile'); // Navigation vers la page profil
              },
            ),
          ],
        ),
      ),

      // Corps de la page avec barre de recherche et liste des produits
      body: Column(
        children: [
          // Barre de recherche pour filtrer les produits
          Padding(
            padding: EdgeInsets.all(10.0),
            child: TextField(
              onChanged: (value) {
                setState(() {
                  searchQuery = value.toLowerCase(); // Met à jour la recherche du filtre
                });
              },
              decoration: InputDecoration(
                labelText: "Rechercher un produit",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),

          // Liste des produits filtrée en fonction de la recherche
          Expanded(
            child: ProductsList(searchQuery: searchQuery),
          ),
        ],
      ),
    );
  }
}

