// Page des médicaments - Permet au client de pouvoir les médicaments +
// ajouter ou diminuer la quantite et panier
// et filtrage de médicaments en gestion temps réel

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/CartItem.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/apiservice.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/Design/BaseLayout.dart';
import 'package:provider/provider.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/CartProvider.dart';

class ProductPage extends StatefulWidget {
  @override
  _ProductPageState createState() => _ProductPageState();
}

class _ProductPageState extends State<ProductPage> {
  List<dynamic> _products = []; // Stocke la liste complète des produits récupérés depuis l’API
  List<dynamic> _filteredProducts = []; // Liste de produits après filtrage (recherche)
  bool _isLoading = true; // Indique si les données sont en cours de chargement
  String searchQuery = ''; // Stocke le texte de la recherche

  @override
  void initState() {
    super.initState();
    loadProducts(); // Charge les produits au démarrage de la page
  }

  // Fonction pour récupérer la liste des produits depuis l'API
  Future<void> loadProducts() async {
    try {
      List<dynamic> data = await ApiService.fetchProducts(); // Appel API
      setState(() {
        _products = data; // Stocke tous les produits
        _filteredProducts = data; // Initialise la liste filtrée avec tous les produits
        _isLoading = false; // Fin du chargement
      });
    } catch (e) {
      print("Erreur lors du chargement des produits : $e");
      setState(() {
        _isLoading = false;
      });
    }
  }

  // Fonction qui filtre les produits en fonction de la recherche
  void updateSearch(String query) {
    setState(() {
      searchQuery = query; // Met à jour le texte entré par l'utilisateur

      if (query.isEmpty) {
        _filteredProducts = _products; // Si la recherche est vide, affiche tous les produits
      } else {
        // Filtrer la liste des produits en fonction du nom
        _filteredProducts = _products
            .where((product) =>
            product['name'].toString().toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context); // Accès au panier via le provider

    return BaseLayout(
      title: 'Médicaments',
      body: Column(
        children: [
          // Barre de recherche pour filtrer les produits
          Padding(
            padding: const EdgeInsets.all(10.0),
            child: TextField(
              onChanged: updateSearch, // Met à jour la recherche en temps réel
              decoration: InputDecoration(
                labelText: "Rechercher un médicament",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),

          // Affichage des produits (soit tous, soit filtrés)
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: Colors.green)) // Affiche un loader si les produits chargent
                : _filteredProducts.isEmpty
                ? Center(child: Text('Aucun médicament trouvé.')) // Message si aucun produit ne correspond à la recherche
                : GridView.builder(
              padding: const EdgeInsets.all(10),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3, // Nombre de colonnes dans la grille
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 0.75, // Ratio largeur/hauteur des cartes produits
              ),
              itemCount: _filteredProducts.length, // Nombre de produits affichés
              itemBuilder: (context, index) {
                return productCard(context, _filteredProducts[index], cart); // Affiche chaque produit avec sa carte
              },
            ),
          ),
        ],
      ),
    );
  }

  // Widget qui construit un produit sous forme de carte
  Widget productCard(BuildContext context, Map<String, dynamic> product, CartProvider cart) {
    final String productId = product['id'].toString(); // Convertir l’ID en String pour éviter les erreurs
    final String productName = product['name'] ?? 'Produit inconnu'; // Gérer les cas où le nom est null
    final double productPrice = (product['price'] ?? 0).toDouble(); // Assurer que le prix est bien un double
    final String productImage = product['image'] ?? 'https://via.placeholder.com/150'; // Image par défaut si absente
    final quantityInCart = cart.items[productId]?.quantite ?? 0; // Vérifier la quantité du produit dans le panier

    return Card(
      elevation: 4, // Ombre autour de la carte
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10), // Coins arrondis
      ),
      child: Column(
        children: [
          // 🔹 Image du produit
          Expanded(
            child: Image.network(
              productImage,
              fit: BoxFit.cover,
              width: double.infinity,
              errorBuilder: (context, error, stackTrace) {
                return Image.asset('assets/images/default_product.png'); // Image par défaut si erreur
              },
            ),
          ),

          // Nom du produit
          Padding(
            padding: const EdgeInsets.all(5),
            child: Text(
              productName,
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.bold),
              maxLines: 2,
              overflow: TextOverflow.ellipsis, // Coupe le texte trop long
            ),
          ),

          // Prix du produit
          Text(
            '${productPrice.toStringAsFixed(2)}€',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),

          // Boutons pour ajouter ou retirer du panier
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Bouton "Retirer du panier"
              IconButton(
                icon: Icon(Icons.remove_circle, color: Colors.red),
                onPressed: quantityInCart > 0
                    ? () => cart.removeItem(productId)
                    : null, // Désactivé si la quantité est 0
              ),

              // Affichage de la quantité actuelle
              Text(
                quantityInCart.toString(),
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),

              // Bouton "Ajouter au panier"
              IconButton(
                icon: Icon(Icons.add_circle, color: Colors.green),
                onPressed: () {
                  cart.addItem(CartItem(
                    id: productId,
                    nom: productName,
                    prix: productPrice,
                    quantite: 1, // Ajoute 1 produit
                    imageUrl: productImage,
                  ));
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
