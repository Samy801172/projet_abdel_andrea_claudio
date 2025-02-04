// Appel vers l'API pour crée un paiement

import 'dart:convert';
import 'package:gohanmedic_flutterprojetmobile/Pages/PaypalPaymentPage.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/Payment.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/Product.dart';
import 'config.dart';


class PaymentService {
  // Utilisez l'URL de base définie dans votre fichier config.dart
  static const String baseUrl = Config.baseUrl;

  // Méthode pour créer un paiement
  Future<void> createPayment(List<Product> cartItems, BuildContext context) async {
    double totalAmount = cartItems.fold(0, (sum, item) => sum + item.prix * item.quantite);

    // Créer un objet Payment
    Payment newPayment = Payment(
      id: 'payment-${DateTime.now().millisecondsSinceEpoch}', // Générer un ID unique
      total: totalAmount,
      status: 'pending', // Le paiement est en attente au début
      items: cartItems,
      paymentDate: DateTime.now(),
    );

    // Envoyer l'objet Payment au backend pour initialiser la transaction PayPal
    final response = await http.post(
      Uri.parse('${Config.baseUrl}/payment/paypal/create'), //NE PAS OUBLIER DE MODIFIER ADRESSE API
      body: json.encode(newPayment.toMap()),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final paymentData = json.decode(response.body);
      String paypalUrl = paymentData['paypalUrl'];

      // Rediriger l'utilisateur vers PayPal via WebView
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PayPalPaymentPage(paymentUrl: paypalUrl),
        ),
      );
    } else {
      print('Erreur lors de la création du paiement');
    }
  }

  // Méthode pour vérifier le paiement après la redirection vers PayPal
  Future<void> verifyPayment(String paymentId, String payerId, BuildContext context) async {
    // Envoie une requête pour vérifier le paiement avec paymentId et payerId
    final response = await http.post(
      Uri.parse('${Config.baseUrl}/payments/paypal'), // METTRE LA BONNE URL !!!
      body: json.encode({
        'paymentId': paymentId,
        'payerId': payerId,
      }),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final paymentData = json.decode(response.body);
      Payment updatedPayment = Payment.fromMap(paymentData);

      // Une fois le paiement vérifié, on appelle une nouvelle méthode pour réduire le stock
      await updateStock(updatedPayment);

      // Mettre à jour le statut du paiement côté mobile + rediriger vers la page de résumé
      Navigator.pushNamed(context, '/order-summary', arguments: updatedPayment);
    } else {
      Navigator.pushNamed(context, '/payment-failed');
    }
  }

  // Nouvelle méthode pour mettre à jour le stock après paiement réussi
  // Utilisé directement après la vérification du paiement réussi et avant la page de résumé de commande
  Future<void> updateStock(Payment payment) async {
    for (var item in payment.items) {// Pour chaque produit dans le paiement, on envoie une requête pour réduire le stock
      final response = await http.post(
        Uri.parse('http://ton-serveur-api.com/update-stock'),  // METTRE LA BONNE URL !!!
        body: json.encode({
          'productId': item.id,  // ID du produit
          'quantity': item.quantite,  // Quantité achetée
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        print('Stock mis à jour pour le produit ${item.nom}');
      } else {
        print('Erreur lors de la mise à jour du stock pour ${item.nom}');
      }
    }
  }
}
