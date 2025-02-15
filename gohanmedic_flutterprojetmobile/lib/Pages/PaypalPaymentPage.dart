import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:http/http.dart' as http;
import 'package:gohanmedic_flutterprojetmobile/Services/PaymentService.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/Payment.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/config.dart';


class PayPalPaymentPage extends StatefulWidget {
  final String paymentUrl;

  const PayPalPaymentPage({Key? key, required this.paymentUrl}) : super(key: key);

  @override
  _PayPalPaymentPageState createState() => _PayPalPaymentPageState();
}

class _PayPalPaymentPageState extends State<PayPalPaymentPage> {
  late final WebViewController _controller;
  static const String baseUrl = Config.apiUrl;


  @override
  void initState() {
    super.initState();

    print("📡 WebView charge : ${widget.paymentUrl}");

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            _onPageStarted(url);
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  // Cette fonction sera appelée lorsque l'utilisateur sera redirigé vers l'URL de confirmation.
  void _onPageStarted(String url) async {
    // Utilisez l'URL de base définie dans votre fichier config.dart
    if (url.contains("success")) {
      // L'utilisateur a terminé le paiement
      // Récupérer l'ID de paiement et de l'acheteur depuis l'URL
      final paymentId = extractPaymentId(url);
      final payerId = extractPayerId(url);

      // Appelle l'API pour vérifier le paiement et créer la commande
      final response = await http.post(
        Uri.parse('$baseUrl/payments/paypal/create'),
        body: {'paymentId': paymentId, 'payerId': payerId},
      );

      if (response.statusCode == 200) {
        final paymentData = response.body; // Si le paiement est validé, reçoit les données de la commande validée
        Payment payment = Payment.fromMap(paymentData as Map<String, dynamic>); // Transformer en objet Payment

        // Mettre à jour le stock et la base de données (par exemple, en appelant une autre API pour ça)
        await PaymentService().updateStock(payment);

        // Traite la réponse : commande validée, affiche un message à l'utilisateur
        // Affiche la page de résumé du détails de commande
        Navigator.pushNamed(context, '/order-summary', arguments: payment);
      } else {
        // Le paiement a échoué
        Navigator.pushNamed(context, '/payment-failed');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('PayPal Payment')),
      body: WebViewWidget(controller: _controller),

    );
  }

  // Fonctions pour extraire paymentId et payerId depuis l'URL (exemple)
  String extractPaymentId(String url) {
    // Logique pour extraire le paymentId à partir de l'URL de confirmation
    // Cela dépend de la structure de l'URL renvoyée par PayPal
    // Exemple :
    return url.split('paymentId=')[1].split('&')[0];
  }

  String extractPayerId(String url) {
    // Logique pour extraire payerId à partir de l'URL de confirmation
    // Exemple :
    return url.split('PayerID=')[1];
  }
}
