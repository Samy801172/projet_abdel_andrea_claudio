import 'dart:convert';
import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/config.dart';
import 'package:http/http.dart' as http;


class ProductsList extends StatefulWidget {
  final String searchQuery;

// Constructeur pour recevoir la recherche depuis HomePage
  ProductsList({required this.searchQuery}); // paramètre qui vient de Home et permet de filtrer les produits

  @override
  _ProductsListState createState() => _ProductsListState();
}

class _ProductsListState extends State<ProductsList> {
  List<dynamic> _products = []; // Stocke les produits récupérés de l'API
  List<dynamic> _promotions = []; // Stocke uniquement les produits en promo
  bool _isLoading = true; // Indique si les données sont en chargement

  get http => null;

  @override
  void initState() {
    super.initState();
    fetchProducts(); // Charge les produits au démarrage
  }

  // Fonction pour récupérer la liste des produits depuis l'API et stock les infos
  Future<void> fetchProducts() async {
    try {
      final response = await http.get(Uri.parse('${Config.apiUrl}products')); // Appel API
      if (response.statusCode == 200) {
        final data = json.decode(response.body); //Converti la réponse JSON en objet Dart
        setState(() { // permet la mise à jour de products
          _products = data; // Stocke tous les produits
          // Filtrer les promos et vérifie si elle existe
          _promotions = data.where((p) => p['promotion_price'] != null).toList();
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

    // Filtre les produits pour n’afficher que ceux correspondant à la recherche
    final filteredProducts = _products.where((product) {
      final productName = product['name']?.toLowerCase() ?? ''; // Assure qu'on ne traite pas une valeur null, ce qui évite les erreurs
      return productName.contains(widget.searchQuery.toLowerCase());
    }).toList();

    return ListView.builder( // création dynamique pour chaque produit
      itemCount: filteredProducts.length,
      itemBuilder: (context, index) {
        final product = filteredProducts[index];
        final bool hasPromotion = product['promotion_price'] != null; // vérifie si un medoc est en promo
        //Converti la date de fin de promo en datetime
        final DateTime? promoEnd = hasPromotion ? DateTime.parse(product['promotion_end']) : null;

        // Class Card qui permet un certain affichage design pour l'appli concernant les détails du médicament
        return Card(
          color: Colors.green[100],
          margin: EdgeInsets.all(8.0),
          child: ListTile(
            leading: Image.network( //récupère l'image via une url internet
              product['image'],
              width: 50,
              height: 50,
              fit: BoxFit.cover,
            ),
            title: Text(product['name'] ?? 'Produit',
                style: TextStyle(color: Colors.green[800], fontWeight: FontWeight.bold)),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product['description'] ?? 'Description non disponible'),
                if (hasPromotion) ...[
                  Row(
                    children: [
                      Text(
                        '${product['price']}€', // Prix barré si promo
                        style: TextStyle(decoration: TextDecoration.lineThrough, color: Colors.grey),
                      ),
                      SizedBox(width: 5),
                      Text(
                        '${product['promotion_price']}€',
                        // Si promotion_price est dispo', le prix est barré et
                        // prix promo affiché en rouge et gras
                        style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  CountdownTimer(endTime: promoEnd!), // Affichage du compte à rebours h + m + sec
                  // mise à jour toutes les secondes
                ] else ...[
                  Text(
                    '${product['price']}€', // Prix normal si pas de promo
                    style: TextStyle(color: Colors.green[900]),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

//Widget pour afficher le compte à rebours d'une promotion
class CountdownTimer extends StatefulWidget {
  final DateTime endTime;

  CountdownTimer({required this.endTime});

  @override
  _CountdownTimerState createState() => _CountdownTimerState();
}

class _CountdownTimerState extends State<CountdownTimer> {
  late Duration _remainingTime;
  late Timer _timer;

  @override
  void initState() {
    super.initState();
    _remainingTime = widget.endTime.difference(DateTime.now());
    _timer = Timer.periodic(Duration(seconds: 1), (timer) {
      setState(() {
        _remainingTime = widget.endTime.difference(DateTime.now());
        if (_remainingTime.isNegative) {
          _timer.cancel();
        }
      });
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_remainingTime.isNegative) {
      return Text('Promotion terminée', style: TextStyle(color: Colors.grey));
    }
    return Text(
      'Promo finit dans : ${_remainingTime.inHours}h ${_remainingTime.inMinutes % 60}m ${_remainingTime.inSeconds % 60}s',
      style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
    );
  }
}
