// 📡 Service de gestion des paiements avec PayPal
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'package:gohanmedic_flutterprojetmobile/Services/config.dart';

import '../Provider/CartProvider.dart';

class PaymentService {
  static const String baseUrl = Config.apiUrl;

  // 📡 **Création d'un paiement PayPal**
  static Future<void> startPayPalPayment(BuildContext context, double totalAmount, int clientId) async {
    try {
      print("📡 [API] Création de la commande PayPal...");
      print("💰 Montant total : $totalAmount");
      print("🔑 Client ID : $clientId");

      // ✅ Vérifier que le panier n'est pas vide
      if (totalAmount <= 0) {
        print("❌ ERREUR: Le panier est vide !");
        showErrorPage(context);
        return;
      }

      final response = await http.post(
        Uri.parse('$baseUrl/payments/paypal/create'),
        body: json.encode({
          "clientId": clientId,
          "amount": totalAmount,
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);

        // 🚨 Vérification complète de la réponse API
        print("🔍 Réponse brute de l'API : $data");

        // ✅ `orderId` est un `String`, on le récupère tel quel
        String? orderId = data['id'];

        if (orderId == null || orderId.isEmpty) {
          print("❌ ERREUR: `orderId` est NULL ou vide !");
          return;
        }
        print("✅ Order ID récupéré : $orderId");

        // ✅ Extraction de l'URL PayPal
        String approvalUrl = data['links'].firstWhere(
              (link) => link['rel'] == 'approve',
          orElse: () => {'href': ''},
        )['href'];

        if (approvalUrl.isEmpty) {
          print("❌ Erreur : `approvalUrl` est vide !");
          return;
        }

        print("✅ [API] Paiement PayPal créé avec succès. Order ID: $orderId");
        print("🔗 Redirection PayPal: $approvalUrl");

        // 🔗 **Ouvrir PayPal dans un navigateur externe**
        if (await canLaunchUrl(Uri.parse(approvalUrl))) {
          await launchUrl(Uri.parse(approvalUrl), mode: LaunchMode.externalApplication);

          // 🎯 **Attendre le retour de PayPal pour capturer le paiement**
          Future.delayed(Duration(seconds: 10), () {
            capturePayment(orderId, clientId, context);
          });
        } else {
          throw Exception("Impossible d'ouvrir PayPal");
        }
      } else {
        print("❌ [API] Erreur lors de la création de la commande PayPal : ${response.body}");
        showErrorPage(context);
      }
    } catch (e) {
      print("❌ [API] Erreur inattendue lors du paiement PayPal : $e");
      showErrorPage(context);
    }
  }

  // 📌 **Capturer le paiement PayPal après validation**
  // 📌 **Capturer le paiement PayPal après validation**
  static Future<void> capturePayment(String orderId, int clientId, BuildContext context) async {
    try {
      print("📡 Capture du paiement PayPal pour Order ID: $orderId...");

      final response = await http.post(
        Uri.parse('$baseUrl/payments/paypal/capture/$orderId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        print("✅ Paiement capturé avec succès !");

        // 🛒 **Vider le panier côté Flutter APRÈS paiement validé**
        final cartProvider = Provider.of<CartProvider>(context, listen: false);
        cartProvider.clearCart(clientId,context);

        print("🛒 Panier vidé après paiement validé.");

        // 🚀 Redirection vers la page de confirmation de commande
        Navigator.pushNamed(context, '/commande-page', arguments: orderId);
      } else {
        print("❌ Erreur lors de la capture du paiement : ${response.body}");
        showErrorPage(context);
      }
    } catch (e) {
      print("❌ [API] Erreur lors de la capture du paiement : $e");
      showErrorPage(context);
    }
  }

  // ❌ **Affiche la page d'erreur en cas d'échec du paiement**
  static void showErrorPage(BuildContext context) {
    Navigator.pushNamed(context, '/payment-failed');
  }
}