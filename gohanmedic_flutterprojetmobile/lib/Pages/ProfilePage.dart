// Page pour le profil d'un client + lien vers sa liste de commande (avec notifcation de changement)
// commande avec médicament sur mesure aussi

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';



// Cette classe présente les informations du profil utilisateur.
class ProfilePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Profil'),
      ),
      body: Center(
        child: Text('Informations du profil.'),
      ),
    );
  }
}