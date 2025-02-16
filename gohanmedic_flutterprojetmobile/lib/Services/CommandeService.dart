// 📡 Service pour récupérer les commandes depuis l'API

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../Models/Commande.dart';
import 'config.dart';
import 'HttpStatus.dart'; // ✅ Import pour vérifier les statuts HTTP

class CommandeService {
  static const String baseUrl = Config.apiUrl;

  // 🔄 **Récupère la liste des commandes d'un client**
  Future<List<Commande>> fetchOrders(String clientId) async {
    try {
      print("📡 [API] Récupération des commandes pour client ID: $clientId...");

      // ✅ Correction de l'URL : Suppression du `/api/` superflu si déjà géré dans `Config.apiUrl`
      final response = await http.get(Uri.parse('$baseUrl/clients/$clientId/orders'));

      print("🔵 [API] Statut HTTP reçu: ${response.statusCode}");

      // ✅ Vérification avec HttpStatus
      if (response.statusCode == HttpStatus.ok) {
        List<dynamic> data = json.decode(response.body);
        print("✅ [API] ${data.length} commandes récupérées.");

        // 🛠 **Correction : Sécurisation de la conversion JSON → Commande**
        List<Commande> commandes = data.map((order) {
          try {
            return Commande.fromJson(order);
          } catch (e) {
            print("❌ ERREUR : Impossible de convertir cette commande : $e");
            return null; // Ajout d'une sécurité
          }
        }).whereType<Commande>().toList(); // ✅ Supprime les valeurs nulles

        return commandes;
      } else {
        print("❌ [API] Erreur - Statut ${response.statusCode} : ${response.body}");
        throw Exception("Erreur API : Statut ${response.statusCode}");
      }
    } catch (e) {
      print("❌ [API] Erreur réseau : $e");
      throw Exception("Erreur réseau lors de la récupération des commandes");
    }
  }

  // 🔎 **Récupère les détails d'une commande**
  Future<Commande?> fetchOrderDetails(String orderId) async {
    try {
      print("📡 [API] Récupération des détails de la commande ID: $orderId...");

      final response = await http.get(Uri.parse('$baseUrl/orders/$orderId'));

      print("🔵 [API] Statut HTTP reçu: ${response.statusCode}");

      if (response.statusCode == HttpStatus.ok) {
        Map<String, dynamic> data = json.decode(response.body);
        print("✅ [API] Détails de la commande récupérés avec succès !");

        // 🛠 **Correction : Sécurisation de la conversion JSON → Commande**
        try {
          return Commande.fromJson(data);
        } catch (e) {
          print("❌ ERREUR : Impossible de convertir cette commande : $e");
          return null;
        }
      } else {
        print("❌ [API] Erreur - Statut ${response.statusCode} : ${response.body}");
        return null;
      }
    } catch (e) {
      print("❌ [API] Erreur réseau : $e");
      return null;
    }
  }
}