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
  List<dynamic> _products = []; // Stocke la liste complète des médicaments
  List<dynamic> _filteredProducts = []; // Liste filtrée pour la recherche
  bool _isLoading = true; // Indique si les données sont en cours de chargement
  String searchQuery = ''; // Stocke le texte de la recherche

  @override
  void initState() {
    super.initState();
    loadProducts();
  }

  // 🔹 Charge les médicaments depuis l'API
  Future<void> loadProducts() async {
    try {
      List<dynamic> data = await ApiService.fetchProducts(); // Appel API
      print("🔍 Produits récupérés depuis l'API : ${jsonEncode(data)}"); // 🔥 Debug API

      setState(() {
        _products = data;
        _filteredProducts = data;
        _isLoading = false;
      });
    } catch (e) {
      print("❌ Erreur lors du chargement des produits : $e");
      setState(() {
        _isLoading = false;
      });
    }
  }

  // 🔹 Filtrage des produits selon la recherche
  void updateSearch(String query) {
    setState(() {
      searchQuery = query;

      if (query.isEmpty) {
        _filteredProducts = _products;
      } else {
        _filteredProducts = _products
            .where((product) =>
            product['name'].toString().toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context, listen: true); // 🔥 Mise à jour dynamique du panier

    return BaseLayout(
      title: 'Médicaments',
      requireAuthentication: false,
      body: Column(
        children: [
          // 🔍 Barre de recherche
          Padding(
            padding: const EdgeInsets.all(10.0),
            child: TextField(
              onChanged: updateSearch,
              decoration: InputDecoration(
                labelText: "Rechercher un médicament",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),

          // 📦 Affichage des médicaments sous forme de grille
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: Colors.green))
                : _filteredProducts.isEmpty
                ? Center(child: Text('Aucun médicament trouvé.'))
                : GridView.builder(
              padding: const EdgeInsets.all(5),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4, // Nombre de colonnes
                crossAxisSpacing: 5,
                mainAxisSpacing: 5,
                childAspectRatio: 0.65,
              ),
              itemCount: _filteredProducts.length,
              itemBuilder: (context, index) {
                return ProductCard(product: _filteredProducts[index]); // ✅ Utilisation du widget `ProductCard`
              },
            ),
          ),
        ],
      ),
    );
  }
}

// 🏷️ `ProductCard` - Gère l'affichage et la gestion des quantités d'un médicament
class ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;

  ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context, listen: true);

    // ✅ Récupère bien `id`, qui est maintenant correctement mappé
    final String? productId = product['id']?.toString();

    final String productName = product['name'] ?? 'Produit inconnu';
    final double productPrice = double.tryParse(product['price'].toString()) ?? 0.0;
    final String productImage = product['image'] ?? 'assets/images/defautproduit.png';

    // 🔍 Vérification dans la console
    print("📌 Produit affiché : $productName, ID = $productId");

    if (productId == null) {
      print("❌ ERREUR : L'ID du produit est NULL !");
      return SizedBox(); // Évite d'afficher un produit sans ID
    }

    int quantity = cart.items.containsKey(productId) ? cart.items[productId]!.quantite : 0;

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          // 📸 Image du produit
          Expanded(
            flex: 3,
            child: Padding(
              padding: const EdgeInsets.all(5),
              child: Image.network(
                productImage,
                fit: BoxFit.cover,
                width: double.infinity,
                errorBuilder: (context, error, stackTrace) {
                  return Image.asset('assets/images/defautproduit.png', fit: BoxFit.cover);
                },
              ),
            ),
          ),

          // 🏷️ Nom du produit
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

          // 💰 Prix du produit
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(
              '${productPrice.toStringAsFixed(2)}€',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green[900]),
            ),
          ),

          // ➖➕ Gestion des quantités
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: Icon(Icons.remove_circle, color: Colors.red, size: 18),
                onPressed: quantity > 0 ? () => cart.removeItem(productId) : null,
              ),
              Text(
                quantity.toString(),
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: Icon(Icons.add_circle, color: Colors.green, size: 18),
                onPressed: () {
                  cart.addItem(CartItem(
                    id: productId, // ✅ Correction ici : Utilisation de `id`
                    nom: productName,
                    prix: productPrice,
                    quantite: 1,
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