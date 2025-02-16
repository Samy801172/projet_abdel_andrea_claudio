// 📄 **Page de Détails d'une Commande**
// Affiche toutes les informations concernant une commande spécifique,
// y compris les produits commandés, le montant total et l'adresse de livraison.

import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Models/Commande.dart';

class CommandeDetailPage extends StatelessWidget {
  // ✅ **Paramètre :** Reçoit un objet `Commande` contenant toutes les informations d'une commande.
  final Commande order;

  // 📌 **Constructeur** : Requiert obligatoirement un objet `Commande` pour afficher les détails.
  CommandeDetailPage({required this.order});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // 🏷️ **AppBar** : Affiche le titre avec l'ID de la commande
      appBar: AppBar(title: Text("Détails de la Commande #${order.id}")),

      // 📌 **Corps de la page** : Contient les informations de la commande et la liste des produits commandés
      body: Padding(
        padding: EdgeInsets.all(16.0), // 🖼️ Ajoute une marge autour du contenu
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, // 📍 Aligne le texte à gauche
          children: [
            // 🆔 **Numéro de commande**
            Text(
              "Numéro de commande: ${order.id}",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 10), // 📏 Espacement

            // 📅 **Date de commande**
            Text("Date de commande: ${order.orderDate.toLocal()}"),

            // 🏷️ **Statut de la commande** (exemple : "En cours", "Livrée", etc.)
            Text(
              "Statut: ${order.status}",
              style: TextStyle(color: Colors.blue),
            ),

            // 💰 **Montant total payé**
            Text("Montant total payé: ${order.montanttotal} €"),

            SizedBox(height: 10), // 📏 Espacement

            // 📦 **Adresse de livraison** (Affichée uniquement si elle existe)
            if (order.livraisonAddress.isNotEmpty)
              Text("Adresse de livraison: ${order.livraisonAddress}"),

            Divider(), // 📌 Séparation visuelle avant la liste des produits

            // 🏷️ **Titre de la section produits**
            Text(
              "Produits commandés:",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),

            // 📦 **Liste des produits commandés**
            Expanded(
              child: ListView.builder(
                itemCount: order.items.length, // 📌 Nombre total de produits commandés
                itemBuilder: (context, index) {
                  var item = order.items[index]; // 📦 Produit actuel

                  return ListTile(
                    title: Text(item.nom), // 🏷️ Nom du produit
                    subtitle: Text("Quantité: ${item.quantite} x ${item.prix} €"), // 🔢 Quantité et prix unitaire
                    trailing: Text("${item.prix * item.quantite} €"), // 💰 Prix total pour cet article
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}