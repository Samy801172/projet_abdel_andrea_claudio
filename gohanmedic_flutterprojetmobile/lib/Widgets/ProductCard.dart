// 📦 Widget ProductCard - Affichage et gestion d'un produit dans le panier

import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/CartItem.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/CartProvider.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/AuthentificationProvider.dart';
import 'package:provider/provider.dart';

class ProductCard extends StatefulWidget {
  final Map<String, dynamic> product; // 📌 Données du produit sous forme de Map

  ProductCard({required this.product});

  @override
  _ProductCardState createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard> {
  int quantity = 0; // 🔢 Quantité du produit dans le panier

  @override
  void initState() {
    super.initState();
    final cart = Provider.of<CartProvider>(context, listen: false);
    final int productId = widget.product['id'];

    print("🔍 INIT STATE - Produit ID: $productId");

    // 🎯 Vérifie si le produit est déjà dans le panier et récupère sa quantité
    quantity = cart.items.containsKey(productId)
        ? cart.items[productId]!.quantite
        : 0;

    print("🛒 INIT STATE - Quantité initiale dans le panier: $quantity");
  }

  // ➕ Fonction pour ajouter un produit au panier
  void incrementQuantity() async {
    final cart = Provider.of<CartProvider>(context, listen: false);
    final auth = Provider.of<AuthentificationProvider>(context, listen: false);

    final String? clientIdStr = auth.clientId;

    if (clientIdStr == null) {
      print("❌ ERREUR : clientId est NULL, redirection vers la connexion...");
      Future.microtask(() => Navigator.pushReplacementNamed(context, '/login'));
      return;
    }

    final int clientId = int.tryParse(clientIdStr) ?? 0;

    if (clientId == 0) {
      print("❌ ERREUR : Conversion clientId échouée.");
      return;
    }

    final int productId = widget.product['id'];
    print("➕ AJOUT - Produit ID: $productId");

    await cart.addItem(
      CartItem(
        id: productId,
        nom: widget.product['name'],
        prix: double.tryParse(widget.product['price'].toString()) ?? 0.0,
        quantite: 1,
        imageUrl: widget.product['image'] ?? 'assets/image/defautproduit.png',
        description: widget.product['description'] ?? "Description non disponible",
      ),
      clientId, // ✅ Passe `clientId`
      context, // ✅ Ajoute `context`
    );

    setState(() {
      quantity = cart.items[productId]!.quantite;
    });

    print("✅ AJOUT CONFIRMÉ - Nouvelle quantité: $quantity");
  }

  // ➖ Fonction pour retirer un produit du panier
  void decrementQuantity() async {
    final cart = Provider.of<CartProvider>(context, listen: false);
    final auth = Provider.of<AuthentificationProvider>(context, listen: false);

    final String? clientIdStr = auth.clientId;

    if (clientIdStr == null) {
      print("❌ ERREUR : clientId est NULL, redirection vers la connexion...");
      Future.microtask(() => Navigator.pushReplacementNamed(context, '/login'));
      return;
    }

    final int clientId = int.tryParse(clientIdStr) ?? 0;

    if (clientId == 0) {
      print("❌ ERREUR : Conversion clientId échouée.");
      return;
    }

    final int productId = widget.product['id'];
    print("➖ RETRAIT - Produit ID: $productId");

    await cart.removeItem(productId, clientId, context);

    setState(() {
      quantity = cart.items.containsKey(productId)
          ? cart.items[productId]!.quantite
          : 0;
    });

    print("✅ RETRAIT CONFIRMÉ - Nouvelle quantité: $quantity");
  }

  @override
  Widget build(BuildContext context) {
    final int productId = widget.product['id'];
    final String productName = widget.product['name'] ?? 'Produit inconnu';
    final double productPrice = double.tryParse(widget.product['price'].toString()) ?? 0.0;
    final String productImage = widget.product['image'] ?? 'assets/image/defautproduit.png';

    print("🖥️ AFFICHAGE - Produit ID: $productId, Nom: $productName, Prix: $productPrice€");

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Expanded(
            flex: 3,
            child: Padding(
              padding: const EdgeInsets.all(5),
              child: Image.network(
                productImage,
                fit: BoxFit.cover,
                width: double.infinity,
                errorBuilder: (context, error, stackTrace) {
                  return Image.asset('assets/image/defautproduit.png', fit: BoxFit.cover);
                },
              ),
            ),
          ),
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
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(
              '\${productPrice.toStringAsFixed(2)}€',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green[900]),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: Icon(Icons.remove_circle, color: Colors.red, size: 18),
                onPressed: quantity > 0 ? decrementQuantity : null,
              ),
              Text(quantity.toString(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              IconButton(
                icon: Icon(Icons.add_circle, color: Colors.green, size: 18),
                onPressed: incrementQuantity,
              ),
            ],
          ),
        ],
      ),
    );
  }
}