// Permet l'affichage d'un produit dans la page produit et  + - dans panier
import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/CartItem.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/CartProvider.dart';
import 'package:provider/provider.dart';

class ProductCard extends StatefulWidget {
  final Map<String, dynamic> product;

  ProductCard({required this.product});

  @override
  _ProductCardState createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard> {
  int quantity = 0;

  @override
  void initState() {
    super.initState();
    final cart = Provider.of<CartProvider>(context, listen: false);
    quantity = cart.items.containsKey(widget.product['id'].toString())
        ? cart.items[widget.product['id'].toString()]!.quantite
        : 0;
  }

  void incrementQuantity() {
    final cart = Provider.of<CartProvider>(context, listen: false);
    cart.addItem(CartItem(
      id: widget.product['id'].toString(),
      nom: widget.product['name'],
      prix: double.tryParse(widget.product['price'].toString()) ?? 0.0,
      quantite: 1,
      imageUrl: widget.product['image'] ?? 'assets/images/defautproduit.png',
    ));

    setState(() {
      quantity = cart.items[widget.product['id'].toString()]!.quantite;
    });
  }

  void decrementQuantity() {
    final cart = Provider.of<CartProvider>(context, listen: false);
    cart.removeItem(widget.product['id'].toString());

    setState(() {
      quantity = cart.items.containsKey(widget.product['id'].toString())
          ? cart.items[widget.product['id'].toString()]!.quantite
          : 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    final String productId = widget.product['id'].toString();
    final String productName = widget.product['name'] ?? 'Produit inconnu';
    final double productPrice = double.tryParse(widget.product['price'].toString()) ?? 0.0;
    final String productImage = widget.product['image'] ?? 'assets/images/defautproduit.png';

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
              child: Image.asset(
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
