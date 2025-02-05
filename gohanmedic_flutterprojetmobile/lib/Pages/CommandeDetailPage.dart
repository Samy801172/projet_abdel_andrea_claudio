// Page affiché lorsqu'on demande plus de détail dans la liste des commandes

import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/Commande.dart';

class CommandeDetailPage extends StatelessWidget {
  final Commande order;

  CommandeDetailPage({required this.order});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Détails de la Commande #${order.id}")),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Numéro de commande: ${order.id}", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            SizedBox(height: 10),
            Text("Date de commande: ${order.orderDate.toLocal()}"),
            Text("Statut: ${order.status}", style: TextStyle(color: Colors.blue)),
            Text("Montant total payé: ${order.montanttotal} €"),
            SizedBox(height: 10),
            if (order.livraisonAddress.isNotEmpty) Text("Adresse de livraison: ${order.livraisonAddress}"),
            Divider(),
            Text("Produits commandés:", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Expanded(
              child: ListView.builder(
                itemCount: order.items.length,
                itemBuilder: (context, index) {
                  var item = order.items[index];
                  return ListTile(
                    title: Text(item.nom),
                    subtitle: Text("Quantité: ${item.quantite} x ${item.prix} €"),
                    trailing: Text("${item.prix * item.quantite} €"),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
