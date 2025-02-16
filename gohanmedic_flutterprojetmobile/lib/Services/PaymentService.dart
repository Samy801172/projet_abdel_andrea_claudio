// 📡 Service de gestion des paiements avec PayPal

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import 'package:gohanmedic_flutterprojetmobile/Services/HttpStatus.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/config.dart';
import 'package:uni_links/uni_links.dart';

class PaymentService {
  static const String baseUrl = Config.apiUrl;

  // 🏦 **Créer un paiement PayPal et récupérer l'URL d'approbation**
  static Future<void> startPayPalPayment(BuildContext context, double totalAmount, int clientId) async {
    try {
      print("📡 [API] Création de la commande PayPal...");

      final response = await http.post(
        Uri.parse('$baseUrl/paypal/create'),
        body: json.encode({
          "clientId": clientId,
          "amount": totalAmount,
        }),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
        final data = json.decode(response.body);

        // 📌 Extraire l'URL de paiement PayPal
        String approvalUrl = data['links'].firstWhere((link) => link['rel'] == 'approve')['href'];
        int orderId = data['orderId']; // 🆔 ID de la commande

        print("✅ [API] Paiement PayPal créé avec succès. Redirection vers : $approvalUrl");

        // 🔗 **Ouvrir PayPal dans un navigateur externe**
        if (await canLaunchUrl(Uri.parse(approvalUrl))) {
          await launchUrl(Uri.parse(approvalUrl), mode: LaunchMode.externalApplication);

          // 🎯 Écouter le retour de PayPal
          _listenForPaymentReturn(context, orderId);
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

  // 🔄 **Écouter l'URL de retour après paiement PayPal**
  static void _listenForPaymentReturn(BuildContext context, int orderId) {
    uriLinkStream.listen((Uri? uri) async {
      if (uri == null) return;

      // ✅ Paiement réussi → Redirection PayPal confirmée
      if (uri.toString().contains("paypal-success")) {
        print("✅ Paiement validé avec PayPal, capture en cours...");
        bool success = await capturePayment(orderId);
        if (success) {
          Navigator.pushNamed(context, '/commande-page', arguments: orderId);
        } else {
          Navigator.pushNamed(context, '/payment-failed', arguments: orderId);
        }
      }

      // ❌ Paiement annulé → Redirection vers la page d'échec
      if (uri.toString().contains("paypal-failed")) {
        print("❌ Paiement annulé par l'utilisateur !");
        Navigator.pushNamed(context, '/payment-failed', arguments: orderId);
      }
    });
  }

  // 📌 **Capturer le paiement PayPal après validation**
  static Future<bool> capturePayment(int orderId) async {
    try {
      print("📡 Capture du paiement PayPal pour Order ID: $orderId...");

      final response = await http.post(
        Uri.parse('$baseUrl/paypal/capture/$orderId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == HttpStatus.ok) {
        print("✅ Paiement capturé avec succès !");
        return true;
      } else {
        print("❌ Erreur lors de la capture du paiement : ${response.body}");
        return false;
      }
    } catch (e) {
      print("❌ [API] Erreur lors de la capture du paiement : $e");
      return false;
    }
  }

  // ❌ **Affiche la page d'erreur en cas d'échec du paiement**
  static void showErrorPage(BuildContext context) {
    Navigator.pushNamed(context, '/payment-failed');
  }
}