// Appel de l'API pour récupérer les infos récoltés de la BD

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../Models/Commande.dart';
import 'config.dart';


class CommandeService {
  static const String baseUrl = Config.baseUrl;

  // Récupére la liste des commandes du client
  Future<List<Commande>> fetchOrders(String userId) async {
    final response = await http.get(Uri.parse('$baseUrl/orders/clients/$userId'));

    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      return data.map((order) => Commande.fromMap(order)).toList();
    } else {
      throw Exception('Erreur lors du chargement des commandes');
    }
  }
}