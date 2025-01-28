import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'package:http/http.dart';

class ProductsList extends StatefulWidget {
  @override
  _ProductsListState createState() => _ProductsListState();
}

class _ProductsListState extends State<ProductsList> {
  List<dynamic> _products = [];
  bool _isLoading = true;

  get http => null;

  @override
  void initState() {
    super.initState();
    fetchProducts();
  }

  Future<void> fetchProducts() async {
    try {
      final response = await http.get(Uri.parse('http://your-api-url/products'));
      if (response.statusCode == 200) {
        setState(() {
          _products = json.decode(response.body);
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to load products');
      }
    } catch (e) {
      print(e);
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

    return ListView.builder(
      itemCount: _products.length,
      itemBuilder: (context, index) {
        final product = _products[index];
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
