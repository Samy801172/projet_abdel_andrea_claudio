// Appel vers l'API pour créer un paiement avec PayPal

import 'dart:convert';
import 'package:gohanmedic_flutterprojetmobile/Pages/PaypalPaymentPage.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/Payment.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/CartItem.dart';
import 'package:provider/provider.dart';
import '../Provider/AuthentificationProvider.dart';
import '../Provider/CartProvider.dart';
import 'HttpStatus.dart';
import 'config.dart';

class PaymentService {
  // 🌍 URL de base pour l'API
  static const String baseUrl = Config.apiUrl;

  // 🎯 Fonction pour créer un paiement
  Future<void> createPayment(BuildContext context) async {
    print("🔵 createPayment() appelée !");

    final authProvider = Provider.of<AuthentificationProvider>(context, listen: false);
    String? clientId = authProvider.clientId; // Récupération du clientId

    final cartProvider = Provider.of<CartProvider>(context, listen: false);
    List<CartItem> cartItems = cartProvider.items.values.toList();

    // 🚨 Vérification : Le panier ne doit pas être vide
    if (cartItems.isEmpty) {
      print("❌ ERREUR : Le panier est vide !");
      return;
    }

    // 🛑 Vérification du clientId
    if (clientId == null) {
      print("❌ ERREUR : clientId est NULL !");
      return;
    }

    // 🔄 Conversion du clientId en int si nécessaire
    int? clientIdInt;
    try {
      clientIdInt = int.parse(clientId);
      print("✅ Client ID converti en int : $clientIdInt");
    } catch (e) {
      print("❌ Erreur de conversion du client ID : $e");
      return;
    }

    // 🔢 Calcul du montant total du panier
    double totalAmount = cartItems.fold(0, (sum, item) => sum + item.prix * item.quantite);

    // 🔄 Conversion du panier en JSON correctement formaté
    List<Map<String, dynamic>> itemsJson = cartItems.map((item) => item.toJson()).toList();

    // 📌 Vérification du JSON avant envoi
    print("🛒 Contenu JSON du panier envoyé : ${jsonEncode(itemsJson)}");

    // 📡 Envoi des données au backend pour créer la commande
    final response = await http.post(
      Uri.parse('$baseUrl/payments/paypal/create'),
      body: json.encode({
        "clientId": clientIdInt, // ✅ Envoi du client ID
        "amount": totalAmount,   // ✅ Montant total
        "items": itemsJson,      // ✅ Liste des articles formatée correctement
      }),
      headers: {'Content-Type': 'application/json'},
    );

    // 🛑 Vérification de la réponse du backend
    if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
      final data = json.decode(response.body);
      int orderId = data['orderId']; // ✅ Récupération de l'orderId
      print("🛒 Commande créée avec orderId : $orderId");

      // 🔄 Maintenant, on envoie les infos de paiement avec orderId
      await sendPayment(orderId, totalAmount);
    } else {
      print("❌ Erreur lors de la création de la commande : ${response.body}");
    }
  }

  // 💳 Capture un paiement PayPal
  Future<void> sendPayment(int orderId, double totalAmount) async {
    try {
      // ✅ Vérifier si `orderId` est bien transmis
      print("📡 [API] Envoi du paiement...");
      print("🔍 Vérification de l'orderId : $orderId");

      // ✅ Vérifier l'URL générée
      final url = Uri.parse('$baseUrl/api/payments/paypal/capture/$orderId');
      print("🔗 URL générée : $url");

      final Map<String, dynamic> paymentData = {
        "orderId": orderId,          // ✅ Envoi de l'orderId récupéré
        "paymentMethod": "PayPal",   // ✅ Enum attendu par le backend
        "amount": totalAmount,       // ✅ Montant total du paiement
        "paymentStatus": "PENDING",  // ✅ Statut initial du paiement
      };

      // 📌 Vérification du JSON avant envoi
      print("📋 JSON envoyé : ${jsonEncode(paymentData)}");

      final response = await http.post(
        url,
        body: json.encode(paymentData),
        headers: {'Content-Type': 'application/json'},
      );

      // ✅ Vérifier le statut HTTP avec HttpStatus
      print("🔵 [API] Statut HTTP reçu : ${response.statusCode}");

      if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
        final paymentData = json.decode(response.body);
        String paypalUrl = paymentData['paypalUrl'];

        print("✅ Paiement envoyé avec succès !");
        print("🔗 Redirection PayPal : $paypalUrl");

      } else {
        print("❌ Erreur lors du paiement. Statut : ${response.statusCode}");
        print("❌ Détails de l'erreur : ${response.body}");
      }
    } catch (e) {
      print("❌ [API] Erreur lors de l'envoi du paiement : $e");
    }
  }

  // 📌 Fonction pour vérifier le paiement après la redirection PayPal
  Future<void> verifyPayment(String paymentId, String payerId, BuildContext context) async {
    print("🔵 Vérification du paiement : PaymentID=$paymentId, PayerID=$payerId");

    final response = await http.post(
      Uri.parse('$baseUrl/payments/paypal/verify'),
      body: json.encode({
        'paymentId': paymentId,
        'payerId': payerId,
      }),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
      final paymentData = json.decode(response.body);
      Payment updatedPayment = Payment.fromMap(paymentData);

      // 🔄 Mise à jour du stock après paiement réussi
      await updateStock(updatedPayment);

      // ✅ Redirection vers la page de résumé de commande
      Navigator.pushNamed(context, '/order-summary', arguments: updatedPayment);
    } else {
      print("❌ Paiement non vérifié, redirection vers l'échec.");
      Navigator.pushNamed(context, '/payment-failed');
    }
  }

  // 🔄 Mise à jour du stock après paiement réussi
  Future<void> updateStock(Payment payment) async {
    for (var item in payment.items) {
      final response = await http.post(
        Uri.parse('$baseUrl/products/update-stock'), // ⚠️ Remplace par l'URL correcte de ton API
        body: json.encode({
          'product_id': item.id,
          'quantity': item.quantite,
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
        print("✅ Stock mis à jour pour le produit ${item.nom}");
      } else {
        print("❌ Erreur lors de la mise à jour du stock pour ${item.nom}");
      }
    }
  }
}