// Permet de centralisé l'app bar du dessus + menu fixe qui permet
// aux clients de naviger entre les pages + facilement

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/AuthentificationProvider.dart';

class BaseLayout extends StatelessWidget {
  final String title;
  final Widget body;

  const BaseLayout({Key? key, required this.title, required this.body}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/images/logogohanmedic.png', // Chemin de l'image
              height: 40, // Taille de l'image
            ),
            const SizedBox(width: 10),
            Text(title), // Titre de la page
          ],
        ),
        centerTitle: true,
      ),
      body: body,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          _navigateToPage(context, index);
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Accueil',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.medical_services),
            label: 'Produits',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long),
            label: 'Ordonnance',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.science),
            label: 'Préparation',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: 'Rendez-vous',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: 'Panier',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profil',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.logout),
            label: 'Déconnexion',
          ),
        ],
      ),
    );
  }

  void _navigateToPage(BuildContext context, int index) async {
    switch (index) {
      case 0: // Accueil
        Navigator.pushNamed(context, '/home');
        break;
      case 1: // Produits
        Navigator.pushNamed(context, '/product');
        break;
      case 2: // Ordonnance
        Navigator.pushNamed(context, '/prescription');
        break;
      case 3: // Préparation
        Navigator.pushNamed(context, '/preparation');
        break;
      case 4: // Rendez-vous
        Navigator.pushNamed(context, '/appointment');
        break;
      case 5: // Panier
        Navigator.pushNamed(context, '/cart');
        break;
      case 6: // Profil
        Navigator.pushNamed(context, '/profile');
        break;
      case 7: // Déconnexion
        bool confirm = await _logout(context);
        if (confirm) {
          Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
        }
        break;
      default:
        break;
    }
  }


}
