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
              'assets/image/logogohanmedic.png', // logo intégré
              height: 40,
            ),
            const SizedBox(width: 10),
            Text(title), // Titre de la page
          ],
        ),
        centerTitle: true,
      ),
      body: body,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed, // Permet l'affichage correct même avec plusieurs items
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
            icon: Icon(Icons.logout, color: Colors.red),
            label: 'Déconnexion',
          ),
        ],
      ),
    );
  }

  // Navigation sur le menu
  void _navigateToPage(BuildContext context, int index) async {
    final authProvider = Provider.of<AuthentificationProvider>(context, listen: false);

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
      case 7: // Déconnexion avec confirmation
        bool confirm = await authProvider.confirmLogout(context); // Appel du Provide pour méthode de déconnexion
        if (confirm) {
          await authProvider.logout(); // si client veut déconnecter alors lancement de logout
          Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
        }
        break;
      default:
        break;
    }
  }
}