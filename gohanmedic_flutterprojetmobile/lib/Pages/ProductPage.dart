// 📦 Page des médicaments - Affichage et gestion du panier

import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/apiservice.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/Design/BaseLayout.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/ProductCard.dart'; // 📂 Import du widget ProductCard

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
    loadProducts(); // 🔄 Charge les médicaments à l'ouverture
  }

  // 📈 Charge les médicaments depuis l'API
  Future<void> loadProducts() async {
    try {
      List<dynamic> data = await ApiService.fetchProducts();
      print("\ud83d\udd0d Produits récupérés depuis l'API (\${data.length} items)");

      setState(() {
        _products = data;
        _filteredProducts = data;
        _isLoading = false;
      });
    } catch (e) {
      print("\u274c Erreur lors du chargement des produits : \$e");
      setState(() {
        _isLoading = false;
      });
    }
  }

  // 🔍 Met à jour la liste filtrée en fonction du texte entré
  void updateSearch(String query) {
    setState(() {
      searchQuery = query;
      _filteredProducts = query.isEmpty
          ? _products
          : _products.where((product) =>
          product['name'].toString().toLowerCase().contains(query.toLowerCase())).toList();
    });
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
              onChanged: updateSearch,
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
                ? Center(child: Text('Aucun médicament trouvé.'))
                : GridView.builder(
              padding: const EdgeInsets.all(5),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                crossAxisSpacing: 5,
                mainAxisSpacing: 5,
                childAspectRatio: 0.65,
              ),
              itemCount: _filteredProducts.length,
              itemBuilder: (context, index) {
                return ProductCard(product: _filteredProducts[index]); // 🔗 Utilisation de ProductCard
              },
            ),
          ),
        ],
      ),
    );
  }
}