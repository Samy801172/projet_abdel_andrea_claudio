import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class PaymentErrorPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Échec du paiement')),
      body: Center(
        child: Column(
          children: [
            Text('Le paiement a échoué, veuillez réessayer !'),
            ElevatedButton(
              onPressed: () {
                // Rediriger l'utilisateur vers la page du panier ou réessayer le paiement
                Navigator.pop(context, 'cart');
              },
              child: Text('Réessayer'),
            ),
          ],
        ),
      ),
    );
  }
}
