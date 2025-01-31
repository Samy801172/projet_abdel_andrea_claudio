import 'dart:convert';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/config.dart';
import 'package:http/http.dart' as http;


class ProductsList extends StatefulWidget {
  final String searchQuery;

// Constructeur pour recevoir la recherche depuis HomePage
  ProductsList({required this.searchQuery});

  @override
  _ProductsListState createState() => _ProductsListState();
}

class _ProductsListState extends State<ProductsList> {
  List<dynamic> _products = []; // Stocke les produits récupérés
  bool _isLoading = true; // Indique si les données sont en chargement

  get http => null;

  @override
  void initState() {
    super.initState();
    fetchProducts(); // Charge les produits au démarrage
  }

  // Fonction pour récupérer la liste des produits depuis l'API
  Future<void> fetchProducts() async {
    try {
      final response = await http.get(Uri.parse('${Config.apiUrl}products')); //appel de la class de l'api
      if (response.statusCode == 200) {
        setState(() {
          _products = json.decode(response.body);
          _isLoading = false;
        });
      } else {
        throw Exception('Erreur lors du chargement des produits');
      }
    } catch (e) {
      print("Erreur : $e");
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Center(child: CircularProgressIndicator(color: Colors.green));
    }

    if (_products.isEmpty) {
      return Center(child: Text('Aucun produit disponible.'));
    }

    // Filtrer les produits en fonction du texte entré
    final filteredProducts = _products.where((product) {
      final productName = product['name']?.toLowerCase() ?? '';
      return productName.contains(widget.searchQuery);
    }).toList();

    return ListView.builder(
      itemCount: filteredProducts.length,
      itemBuilder: (context, index) {
        final product = filteredProducts[index];
        return Card(
          color: Colors.green[100],
          margin: EdgeInsets.all(8.0),
          child: ListTile(
            title: Text(product['name'] ?? 'Produit',
                style: TextStyle(color: Colors.green[800])),
            subtitle: Text(product['description'] ?? 'Description non disponible'),
            trailing: Text(product['price'] != null ? '€${product['price']}' : '',
                style: TextStyle(color: Colors.green[900])),
          ),
        );
      },
    );
  }
}
