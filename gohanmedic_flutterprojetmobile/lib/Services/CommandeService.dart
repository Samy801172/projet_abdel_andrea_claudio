// Appel de l'API pour récupérer les infos récoltés de la BD

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../Models/Commande.dart';
import 'config.dart';
import 'HttpStatus.dart'; // ✅ Import de HttpStatus

class CommandeService {
  static const String baseUrl = Config.apiUrl;

  // 🔄 Récupère la liste des commandes d'un client
  Future<List<Commande>> fetchOrders(String clientId) async {
    try {
      print("📡 [API] Récupération des commandes pour client ID: $clientId...");

      // ✅ Correction de l'URL
      final response = await http.get(Uri.parse('$baseUrl/api/clients/$clientId/orders'));

      print("🔵 [API] Statut HTTP reçu: ${response.statusCode}");

      // ✅ Vérification avec HttpStatus
      if (response.statusCode == HttpStatus.ok) {
        List<dynamic> data = json.decode(response.body);
        print("✅ [API] Commandes récupérées : ${data.length} commandes");

        return data.map((order) => Commande.fromMap(order)).toList();
      } else {
        print("❌ [API] Erreur - Statut ${response.statusCode}");
        throw Exception("Erreur API : Statut ${response.statusCode}");
      }
    } catch (e) {
      print("❌ [API] Erreur réseau : $e");
      throw Exception("Erreur réseau");
    }
  }
}