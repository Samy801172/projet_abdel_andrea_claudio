// 📦 Page du Panier - Gestion et modification des articles

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/Design/BaseLayout.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/CartProvider.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/AuthentificationProvider.dart';
import '../Services/PaymentService.dart';

class CartPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context); // 🛒 Accès au panier
    final authProvider = Provider.of<AuthentificationProvider>(context);

    // 🔑 Récupération et conversion de clientId
    final String? clientIdStr = authProvider.clientId;
    int? clientId = clientIdStr != null ? int.tryParse(clientIdStr) : null;

    if (clientId == null) {
      print("⚠️ clientId est NULL ou invalide, utilisateur non connecté.");
    }

    return BaseLayout(
      title: 'Mon Panier',
      requireAuthentication: false, // ✅ Affiche la page même si non connecté
      body: Stack(
        children: [
          cart.items.isEmpty
              ? Center(child: Text('Votre panier est vide')) // 🎭 Affichage si panier vide
              : Column(
            children: [
              // 📋 Liste des articles du panier
              Expanded(
                child: ListView.builder(
                  itemCount: cart.items.length,
                  itemBuilder: (context, index) {
                    final item = cart.items.values.toList()[index];
                    return ListTile(
                      leading: Image.network(item.imageUrl, width: 50), // 🖼️ Image du produit
                      title: Text(item.nom), // 📌 Nom du produit
                      subtitle: Text('${item.prix}€ x ${item.quantite}'), // 💰 Prix et quantité
                      trailing: IconButton(
                        icon: Icon(Icons.remove_circle),
                        onPressed: clientId != null
                            ? () => cart.removeItem(item.id, clientId!, context) // ✅ Correction ici
                            : null,
                      ),
                    );
                  },
                ),
              ),

              // 💰 Affichage du total et bouton de paiement
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
                      onPressed: authProvider.isAuthenticated && clientId != null
                          ? () {
                        print("🟢 Bouton 'Passer au paiement' cliqué !");

                        // 🔄 Démarrage du paiement PayPal avec PaymentService
                        PaymentService.startPayPalPayment(
                          context,
                          cart.totalPrice,
                          clientId!,
                        );
                      }
                          : null, // ❌ Désactive le bouton si non connecté
                      child: Text('Passer au paiement avec PayPal'),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // 🚨 Bannière de connexion si l'utilisateur n'est pas connecté
          if (!authProvider.isAuthenticated)
            Positioned(
              bottom: 10,
              left: 10,
              right: 10,
              child: Card(
                color: Colors.redAccent,
                elevation: 5,
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          'Connectez-vous pour gérer votre panier !',
                          style: TextStyle(color: Colors.white, fontSize: 14),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pushNamed(context, '/login');
                        },
                        child: Text(
                          'Se connecter',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}