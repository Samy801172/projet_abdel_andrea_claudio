// Page affichée en cas d'échec du paiement PayPal
// Permet de retenter la vérification ou de revenir au panier.import 'dart:async';

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:gohanmedic_flutterprojetmobile/Services/config.dart';
import '../Services/HttpStatus.dart';


class PaymentErrorPage extends StatefulWidget {
  final int orderId;

  const PaymentErrorPage({Key? key, required this.orderId}) : super(key: key);

  @override
  _PaymentErrorPageState createState() => _PaymentErrorPageState();
}

class _PaymentErrorPageState extends State<PaymentErrorPage> {
  bool _isChecking = false; // Empêche plusieurs requêtes simultanées
  static const String baseUrl = Config.apiUrl;
  String _statusMessage = "Le paiement semble avoir échoué ou être en attente.";

  @override
  void initState() {
    super.initState();
    // 🔄 Vérification automatique du paiement après 10 secondes
    Future.delayed(Duration(seconds: 10), _retryPaymentCheck);
  }

  /// 🔄 Vérifie si le paiement est validé côté serveur
  Future<void> _retryPaymentCheck() async {
    if (_isChecking) return; // Empêche appels multiples
    setState(() {
      _isChecking = true;
      _statusMessage = "🔄 Vérification du paiement en cours...";
    });

    try {
      print("📡 [API] Vérification du paiement pour OrderID: ${widget.orderId}...");

      final response = await http.get(
        Uri.parse('$baseUrl/payments/status/${widget.orderId}'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == HttpStatus.ok || response.statusCode == HttpStatus.created) {
        final data = json.decode(response.body);
        String status = data['paymentStatus'];

        if (status == "COMPLETED") {
          print("✅ Paiement validé !");
          setState(() => _statusMessage = "✅ Paiement validé ! Redirection en cours...");

          // 🚀 Redirection vers la page de confirmation de commande
          Future.delayed(Duration(seconds: 2), () {
            Navigator.pushReplacementNamed(context, '/commande-page', arguments: data);
          });
        } else {
          print("❌ Paiement toujours en attente...");
          setState(() => _statusMessage = "❌ Paiement non validé. Veuillez réessayer.");
        }
      } else {
        print("⚠️ Erreur lors de la vérification: ${response.body}");
        setState(() => _statusMessage = "⚠️ Erreur de vérification. Réessayez plus tard.");
      }
    } catch (e) {
      print("❌ Erreur réseau: $e");
      setState(() => _statusMessage = "❌ Erreur réseau. Vérifiez votre connexion.");
    }

    setState(() => _isChecking = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Échec du paiement')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              _statusMessage,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),

            _isChecking
                ? CircularProgressIndicator() // 🔄 Affichage de chargement pendant la vérification
                : Column(
              children: [
                ElevatedButton(
                  onPressed: _retryPaymentCheck,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                  child: Text('🔄 Vérifier à nouveau'),
                ),
                SizedBox(height: 10),

                ElevatedButton(
                  onPressed: () {
                    Navigator.pushReplacementNamed(context, '/cart'); // 🔙 Retour au panier
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                  child: Text('🛒 Retour au panier'),
                ),

                SizedBox(height: 10),

                ElevatedButton(
                  onPressed: () {
                    Navigator.pushReplacementNamed(context, '/payment'); // 💳 Retenter paiement
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                  child: Text('💳 Retenter le paiement'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}