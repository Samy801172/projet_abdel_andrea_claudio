// Affiche les commandes avec un bouton pour voir les détails

import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/Commande.dart';
import '../Pages/CommandeDetailPage.dart';
import 'package:gohanmedic_flutterprojetmobile/Services/CommandeService.dart';

class CommandeList extends StatefulWidget {
  final String userId; // ID du client connecté

  CommandeList({required this.userId});

  @override
  _CommandeListState createState() => _CommandeListState();
}

class _CommandeListState extends State<CommandeList> {
  late Future<List<Commande>> futureOrders;

  @override
  void initState() {
    super.initState();
    futureOrders = CommandeService().fetchOrders(widget.userId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Mes Commandes")),
      body: FutureBuilder<List<Commande>>(
        future: futureOrders,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text("Erreur lors du chargement des commandes"));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(child: Text("Aucune commande trouvée"));
          }

          List<Commande> orders = snapshot.data!;
          return ListView.builder(
            itemCount: orders.length,
            itemBuilder: (context, index) {
              Commande order = orders[index];
              return Card(
                child: ListTile(
                  title: Text("Commande #${order.id}"),
                  subtitle: Text("Date: ${order.orderDate.toLocal()} | Statut: ${order.status}"),
                  trailing: ElevatedButton(
                    child: Text("Détails"),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => CommandeDetailPage(order: order)),
                      );
                    },
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}