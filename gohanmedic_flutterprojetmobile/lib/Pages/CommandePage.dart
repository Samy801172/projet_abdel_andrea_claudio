// Page du résumé de commande lorsque le panier et paiement validé

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/Payment.dart';


//Gère l'affichage de résumé lorsque le paiement est ok
class Commandepage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final Payment orderDetails = ModalRoute.of(context)!.settings.arguments as Payment;

    return Scaffold(
      appBar: AppBar(title: Text('Résumé de la Commande')),
      body: Column(
        children: [
          Text('Commande réussie !'),
          Text('Numéro de commande: ${orderDetails.id}'),
          Text('Montant payé: ${orderDetails.total}'),
          ListView.builder(
            itemCount: orderDetails.items.length,
            itemBuilder: (context, index) {
              final item = orderDetails.items[index];
              return ListTile(
                title: Text(item.nom),
                subtitle: Text('Quantité: ${item.quantite}'),
                trailing: Text('Prix: ${item.prix}'),
              );
            },
          ),
        ],
      ),
    );
  }
}
