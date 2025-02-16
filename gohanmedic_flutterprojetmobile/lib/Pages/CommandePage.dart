// Permet de voir le détail résumé d'une commande
// lorsque le paiement est validé + retour vers home

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class CommandePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // 🔄 Récupération des données de la commande depuis les arguments
    final Map<String, dynamic>? orderDetails = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;

    if (orderDetails == null) {
      print("❌ ERREUR : Aucune donnée de commande reçue !");
      return Scaffold(
        appBar: AppBar(title: Text('Résumé de la Commande')),
        body: Center(
          child: Text('❌ Erreur : Impossible de récupérer les détails de la commande.'),
        ),
      );
    }

    // ✅ Extraction des informations
    int orderId = orderDetails['orderId'] ?? 0;
    double totalAmount = (orderDetails['totalAmount'] as num?)?.toDouble() ?? 0.0;
    List<dynamic> items = orderDetails['items'] ?? [];

    print("📋 Commande reçue - ID: $orderId, Montant: $totalAmount€, Produits: ${items.length}");

    return Scaffold(
      appBar: AppBar(title: Text('Résumé de la Commande')),
      body: Column(
        children: [
          SizedBox(height: 20),
          Text(
            '✅ Commande validée avec succès !',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green),
          ),
          SizedBox(height: 10),
          Text('🆔 Numéro de commande : $orderId', style: TextStyle(fontSize: 16)),
          Text('💰 Montant payé : ${totalAmount.toStringAsFixed(2)}€', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          SizedBox(height: 20),

          // 📦 Liste des produits achetés
          Expanded(
            child: items.isNotEmpty
                ? ListView.builder(
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                return ListTile(
                  leading: Image.network(item['imageUrl'] ?? 'assets/image/defautproduit.png', width: 50, height: 50), // 🖼️ Image du produit
                  title: Text(item['name'] ?? "Produit inconnu"), // 🏷️ Nom du produit
                  subtitle: Text('Quantité: ${item['quantity'] ?? 0}'), // 🔢 Quantité
                  trailing: Text('${item['price'].toStringAsFixed(2)}€'), // 💰 Prix
                );
              },
            )
                : Center(child: Text("❌ Aucun article trouvé dans la commande.")),
          ),

          // ✅ Bouton de retour à l'accueil
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton(
              onPressed: () => Navigator.pushReplacementNamed(context, '/home'),
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