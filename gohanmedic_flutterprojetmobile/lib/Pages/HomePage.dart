// Page principal - Menu + promotions du moment, derniers médicaments + login

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../Widgets/ProductsList.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/AuthentificationProvider.dart';

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
              leading: Icon(Icons.home, color: Colors.green[800]),
              title: Text('Accueil'),
              onTap: () {
                Navigator.pushNamed(context, '/home');
              },
            ),
            ListTile(
              leading: Icon(Icons.medical_services, color: Colors.green[800]),
              title: Text('Produits'),
              onTap: () {
                Navigator.pushNamed(context, '/product');
              },
            ),
            ListTile(
              leading: Icon(Icons.receipt_long, color: Colors.green[800]),
              title: Text('Ordonnance'),
              onTap: () {
                Navigator.pushNamed(context, '/prescription');
              },
            ),
            ListTile(
              leading: Icon(Icons.science, color: Colors.green[800]),
              title: Text('Préparation'),
              onTap: () {
                Navigator.pushNamed(context, '/preparation');
              },
            ),
            ListTile(
              leading: Icon(Icons.calendar_today, color: Colors.green[800]),
              title: Text('Rendez-vous'),
              onTap: () {
                Navigator.pushNamed(context, '/appointment');
              },
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
            ListTile(
              leading: Icon(Icons.logout, color: Colors.red[800]),
              title: Text('Déconnexion'),
              onTap: () async {
                bool confirm = await showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return AlertDialog(
                      title: Text("Déconnexion"),
                      content: Text("Voulez-vous vraiment vous déconnecter ?"),
                      actions: [
                        TextButton(
                          onPressed: () {
                            Navigator.of(context).pop(false); // Annuler
                          },
                          child: Text("Annuler"),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.of(context).pop(true); // Confirmer
                          },
                          child: Text("Oui", style: TextStyle(color: Colors.red)),
                        ),
                      ],
                    );
                  },
                );
                if (confirm == true) {
                  final authProvider = Provider.of<AuthentificationProvider>(context, listen: false);
                  await authProvider.logout(); // Appelle la méthode de déconnexion

                  // Redirige l'utilisateur vers l'écran de connexion et supprime l'historique de navigation
                  Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
                }
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

