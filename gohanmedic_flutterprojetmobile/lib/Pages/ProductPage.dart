// 📦 Page des médicaments - Affichage et gestion du panier

import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/apiservice.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/Design/BaseLayout.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/ProductCard.dart';

class ProductPage extends StatefulWidget {
  @override
  _ProductPageState createState() => _ProductPageState();
}

class _ProductPageState extends State<ProductPage> {
  List<dynamic> _products = []; // 📦 Liste complète des médicaments
  List<dynamic> _filteredProducts = []; // 🔍 Liste filtrée pour la recherche
  bool _isLoading = true; // ⏳ Indique si le chargement est en cours
  String searchQuery = ''; // 🔍 Texte de la recherche

  @override
  void initState() {
    super.initState();
    _loadProducts(); // 🔄 Charge les médicaments au démarrage
  }

  // 📈 Charge les médicaments depuis l'API
  Future<void> _loadProducts() async {
    try {
      print("📡 [ProductPage] Chargement des produits...");

      List<dynamic> data = await ApiService.fetchProducts();

      if (data.isEmpty) {
        print("⚠️ [ProductPage] Aucun produit trouvé.");
      } else {
        print("✅ [ProductPage] ${data.length} produits récupérés.");
      }

      setState(() {
        _products = data;
        _filteredProducts = data;
        _isLoading = false;
      });
    } catch (e) {
      print("❌ [ProductPage] Erreur lors du chargement des produits : $e");
      setState(() {
        _isLoading = false;
      });
    }
  }

  // 🔍 Met à jour la liste filtrée en fonction du texte entré
  void _updateSearch(String query) {
    setState(() {
      searchQuery = query;
      _filteredProducts = query.isEmpty
          ? _products
          : _products.where((product) {
        final String name = product['name']?.toString().toLowerCase() ?? "";
        return name.contains(query.toLowerCase());
      }).toList();
    });

    print("🔍 [ProductPage] Résultats filtrés : ${_filteredProducts.length} produits");
  }

  @override
  Widget build(BuildContext context) {
    return BaseLayout(
      title: 'Médicaments',
      requireAuthentication: false,
      body: Column(
        children: [
          // 📝 Barre de recherche
          Padding(
            padding: const EdgeInsets.all(10.0),
            child: TextField(
              onChanged: _updateSearch,
              decoration: InputDecoration(
                labelText: "Rechercher un médicament",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),
          // 📦 Liste des produits
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: Colors.green))
                : _filteredProducts.isEmpty
                ? Center(child: Text('Aucun médicament trouvé.', style: TextStyle(fontSize: 16)))
                : GridView.builder(
              padding: const EdgeInsets.all(8),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3, // 📌 3 colonnes pour correspondre à ta demande
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 0.7, // Ajustement pour de meilleures proportions
              ),
              itemCount: _filteredProducts.length,
              itemBuilder: (context, index) {
                final product = _filteredProducts[index];

                // ✅ Vérification des données avant d'afficher ProductCard
                if (product == null || product['id_product'] == null) {
                  print("❌ Produit invalide détecté : $product");
                  return SizedBox(); // Retourne un widget vide pour éviter l'erreur
                }

                return ProductCard(product: product);
              },
            ),
          ),
        ],
      ),
    );
  }
}