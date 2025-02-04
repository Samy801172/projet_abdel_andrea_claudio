// Page du Panier

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/CartProvider.dart';


class CartPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context); // Accès au panier

    return Scaffold(
      appBar: AppBar(title: Text('Mon Panier')), // Barre d'application avec un titre
      body: cart.items.isEmpty
          ? Center(child: Text('Votre panier est vide')) // Si le panier est vide, on affiche un message
          : Column(
        children: [
          // Liste des articles du panier
          Expanded(
            child: ListView.builder(
              itemCount: cart.items.length,
              itemBuilder: (context, index) {
                final item = cart.items.values.toList()[index]; // Récupération d'un article du panier
                return ListTile(
                  leading: Image.network(item.imageUrl, width: 50), // Affichage de l’image du produit
                  title: Text(item.nom), // Nom du produit
                  subtitle: Text('${item.prix}€ x ${item.quantite}'), // Prix et quantité
                  trailing: IconButton(
                    icon: Icon(Icons.remove_circle),
                    onPressed: () => cart.removeItem(item.id), // Bouton pour supprimer un article
                  ),
                );
              },
            ),
          ),
          // Affichage du total et bouton de paiement
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Text(
                  'Total : ${cart.totalPrice.toStringAsFixed(2)}€',
                  style: TextStyle(fontSize: 18),
                ),
                SizedBox(height: 10),
                ElevatedButton(
                  onPressed: () {
                    // Ici, on ajoutera le paiement PayPal plus tard
                  },
                  child: Text('Passer au paiement avec Paypal'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}