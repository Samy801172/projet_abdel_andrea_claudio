// 📦 Résumé d'une commande validée avec PayPal
// Permet d'afficher les détails et de revenir à l'accueil

import 'package:flutter/material.dart';

class CommandePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // 🔄 Récupération des données de la commande depuis les arguments
    final Map<String, dynamic>? orderDetails = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;

    if (orderDetails == null || !orderDetails.containsKey("orderId")) {
      print("❌ ERREUR : Aucune donnée de commande reçue !");
      return Scaffold(
        appBar: AppBar(title: Text('Résumé de la Commande')),
        body: Center(
          child: Text('❌ Erreur : Impossible de récupérer les détails de la commande.'),
        ),
      );
    }

    // ✅ Extraction des informations
    String orderId = orderDetails['orderId']?.toString() ?? "ID Inconnu";
    double totalAmount = (orderDetails['totalAmount'] as num?)?.toDouble() ?? 0.0;
    List<dynamic> items = orderDetails['items'] ?? [];

    print("📋 Commande reçue - ID: $orderId, Montant: $totalAmount€, Produits: ${items.length}");

    return Scaffold(
      appBar: AppBar(title: Text('Résumé de la Commande')),
      body: Column(
        children: [
          SizedBox(height: 20),
          // ✅ Confirmation de la commande
          Text(
            '✅ Commande validée avec succès !',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green),
          ),
          SizedBox(height: 10),
          Text('🆔 Numéro de commande : $orderId', style: TextStyle(fontSize: 16)),
          Text(
            '💰 Montant payé : ${totalAmount.toStringAsFixed(2)}€',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 20),

          // 📦 Liste des produits achetés
          Expanded(
            child: items.isNotEmpty
                ? ListView.builder(
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                String imageUrl = item['imageUrl'] ?? 'assets/image/defautproduit.png';
                String productName = item['name'] ?? "Produit inconnu";
                int quantity = item['quantity'] ?? 0;
                double price = (item['price'] as num?)?.toDouble() ?? 0.0;

                print("🛒 Produit [$index] : $productName, Quantité: $quantity, Prix: $price€");

                return ListTile(
                  leading: Image.network(
                    imageUrl,
                    width: 50,
                    height: 50,
                    errorBuilder: (context, error, stackTrace) {
                      return Image.asset('assets/image/defautproduit.png', width: 50, height: 50);
                    },
                  ), // 🖼️ Image du produit
                  title: Text(productName), // 🏷️ Nom du produit
                  subtitle: Text('Quantité: $quantity'), // 🔢 Quantité
                  trailing: Text('${price.toStringAsFixed(2)}€'), // 💰 Prix
                );
              },
            )
                : Center(child: Text("❌ Aucun article trouvé dans la commande.")),
          ),

          // ✅ Bouton de retour à l'accueil
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton(
              onPressed: () {
                print("🏠 Retour à l'accueil");
                Navigator.pushReplacementNamed(context, '/home');
              },
              child: Text('🏠 Retour à l\'accueil'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}