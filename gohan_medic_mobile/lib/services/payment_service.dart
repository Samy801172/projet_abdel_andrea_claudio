import 'package:http/http.dart' as http;
import 'dart:convert';
import 'auth_service.dart';

class PaymentService {
  static const String baseUrl = 'http://localhost:2024/api';
  final AuthService _authService = AuthService();

  Future<String> createPaypalOrder(double amount) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Non authentifié');

    try {
      // Créer l'ordre PayPal via notre backend
      final response = await http.post(
        Uri.parse('$baseUrl/payment/paypal/create'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'amount': amount,
          'currency': 'EUR',
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['orderID']; // ID de l'ordre PayPal
      } else {
        throw Exception('Erreur lors de la création de l\'ordre PayPal');
      }
    } catch (e) {
      throw Exception('Erreur de paiement: $e');
    }
  }

  Future<void> capturePaypalPayment(String orderID) async {
    final token = await _authService.getToken();
    if (token == null) throw Exception('Non authentifié');

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/payment/paypal/capture'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'orderID': orderID,
        }),
      );

      if (response.statusCode != 200) {
        throw Exception('Erreur lors de la capture du paiement');
      }
    } catch (e) {
      throw Exception('Erreur de paiement: $e');
    }
  }
} 