// Page des médicaments - Permet au client de consulter les médicaments,
// ajouter ou diminuer la quantité dans le panier et filtrer les médicaments en temps réel.

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
  List<dynamic> _products = []; // Stocke la liste complète des produits récupérés depuis l’API.
  List<dynamic> _filteredProducts = []; // Liste des produits après filtrage (recherche).
  bool _isLoading = true; // Indique si les données sont en cours de chargement.
  String searchQuery = ''; // Stocke le texte de la recherche.

  @override
  void initState() {
    super.initState();
    loadProducts(); // Charge les produits au démarrage de la page.
  }

  // 🔹 Fonction pour récupérer la liste des produits depuis l'API.
  Future<void> loadProducts() async {
    try {
      List<dynamic> data = await ApiService.fetchProducts(); // Appel API
      setState(() {
        _products = data; // Stocke tous les produits
        _filteredProducts = data; // Initialise la liste filtrée avec tous les produits.
        _isLoading = false; // Fin du chargement.
      });
    } catch (e) {
      print("Erreur lors du chargement des produits : $e");
      setState(() {
        _isLoading = false;
      });
    }
  }

  // Fonction qui filtre les produits en fonction de la recherche.
  void updateSearch(String query) {
    setState(() {
      searchQuery = query; // Met à jour le texte entré par l'utilisateur.

      if (query.isEmpty) {
        _filteredProducts = _products; // Si la recherche est vide, affiche tous les produits.
      } else {
        // Filtrer la liste des produits en fonction du nom.
        _filteredProducts = _products
            .where((product) =>
            product['name'].toString().toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context); // Accès au panier via le provider.

    return BaseLayout(
      title: 'Médicaments',
      requireAuthentication: false, // Permet d'afficher la bannière sans bloquer l'accès total.
      body: Column(
        children: [

          // Barre de recherche pour filtrer les produits.
          Padding(
            padding: const EdgeInsets.all(10.0),
            child: TextField(
              onChanged: updateSearch, // Met à jour la recherche en temps réel.
              decoration: InputDecoration(
                labelText: "Rechercher un médicament",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),

          // Affichage des produits (soit tous, soit filtrés).
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: Colors.green)) // Chargement en cours.
                : _filteredProducts.isEmpty
                ? Center(child: Text('Aucun médicament trouvé.')) // Aucun résultat trouvé.
                : GridView.builder(
              padding: const EdgeInsets.all(5), // Moins de padding pour un affichage plus dense.
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4, // Nombre de colonne
                crossAxisSpacing: 5, // Réduit l’espacement horizontal.
                mainAxisSpacing: 5, // Réduit l’espacement vertical.
                childAspectRatio: 0.65, // Ajuste la taille des cartes (plus compact).
              ),
              itemCount: _filteredProducts.length, // Nombre de produits affichés.
              itemBuilder: (context, index) {
                return productCard(context, _filteredProducts[index], cart); // Affichage de chaque produit.
              },
            ),
          ),
        ],
      ),
    );
  }

  // Widget qui construit un produit sous forme de carte compacte.
  Widget productCard(BuildContext context, Map<String, dynamic> product, CartProvider cart) {
    final String productId = product['id'].toString(); // Convertir l’ID en String pour éviter les erreurs.
    final String productName = product['name'] ?? 'Produit inconnu'; // Gérer les cas où le nom est null.
    final double productPrice = double.tryParse(product['price'].toString()) ?? 0.0; // Assurer que le prix est bien un double.
    final String productImage = product['image'] ?? 'https://via.placeholder.com/150'; // Image par défaut si absente.

    // Vérifie si le produit est déjà dans le panier et initialise `ValueNotifier`
    final ValueNotifier<int> quantityNotifier = ValueNotifier<int>(
        cart.items.containsKey(productId) ? cart.items[productId]!.quantite : 0
    );

    return Card(
      elevation: 2, // Moins d'ombre pour éviter un effet "trop grand".
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8), // Coins légèrement arrondis.
      ),
      child: Column(
        children: [

          // Image du produit
          Expanded(
            flex: 3, // Réduit l’espace occupé par l’image
            child: Padding(
              padding: const EdgeInsets.all(5),
              child: Image.network(
                productImage,
                fit: BoxFit.cover,
                width: double.infinity,
                errorBuilder: (context, error, stackTrace) {
                  return Image.asset('assets/images/default_product.png', fit: BoxFit.cover);
                },
              ),
            ),
          ),

          //Nom du produit
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 5),
            child: Text(
              productName,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),

          // Prix du produit
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(
              '${productPrice.toStringAsFixed(2)}€',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green[900]),
            ),
          ),

          // Gestion de la quantité avec ValueListenableBuilder
          ValueListenableBuilder<int>(
            valueListenable: quantityNotifier, // Écoute les changements de quantité.
            builder: (context, quantity, child) {
              return Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    icon: Icon(Icons.remove_circle, color: Colors.red, size: 18),
                    onPressed: quantity > 0
                        ? () {
                      cart.removeItem(productId);
                      quantityNotifier.value = cart.items.containsKey(productId)
                          ? cart.items[productId]!.quantite
                          : 0;
                    }
                        : null,
                  ),
                  Text(quantity.toString(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: Icon(Icons.add_circle, color: Colors.green, size: 18),
                    onPressed: () {
                      cart.addItem(CartItem(id: productId, nom: productName, prix: productPrice, quantite: 1, imageUrl: productImage));
                      quantityNotifier.value = cart.items.containsKey(productId)
                          ? cart.items[productId]!.quantite
                          : 0;
                    },
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}