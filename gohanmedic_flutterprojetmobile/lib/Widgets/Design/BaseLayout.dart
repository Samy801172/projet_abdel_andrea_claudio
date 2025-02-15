// Permet de centralisé l'app bar du dessus + menu fixe qui permet
// aux clients de naviger entre les pages + facilement

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/AuthentificationProvider.dart';

class BaseLayout extends StatelessWidget {
  final String title;
  final Widget body;
  final bool requireAuthentication; // Nouveau paramètre pour contrôler l'accès

  const BaseLayout(
      {Key? key,
        required this.title,
        required this.body,
      this.requireAuthentication = true} // Par défaut, toutes les pages sont protégées
      ) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthentificationProvider>(context);
    final isAuthenticated = authProvider.isAuthenticated;

    // Si l'utilisateur n'est pas connecté et que la page nécessite une connexion,
    // redirection vers la page de connexion
    if (requireAuthentication && !isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
      });

      // Retourne un écran temporaire pendant la redirection
      return Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    // affiche la page normalement si l'utilisateur est connecté ou
    // si la connexion n'est pas requise
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

      // Menu de navigation en bas de page
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed, // Permet l'affichage correct même avec plusieurs items
        onTap: (index) {
          _navigateToPage(context, index);
        },
        items: _buildBottomNavItems(context), // Génère la liste dynamiquement
      ),
    );
  }

  // Génère dynamiquement les éléments du menu
  List<BottomNavigationBarItem> _buildBottomNavItems(BuildContext context) {
    final authProvider = Provider.of<AuthentificationProvider>(context);
    final bool isLoggedIn = authProvider.isUserLoggedIn(); // Vérifie si l'utilisateur est connecté

    List<BottomNavigationBarItem> items = [
      const BottomNavigationBarItem(
        icon: Icon(Icons.home),
        label: 'Accueil',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.medical_services),
        label: 'Produits',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.receipt_long),
        label: 'Ordonnance',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.science),
        label: 'Préparation',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.calendar_today),
        label: 'Rendez-vous',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.shopping_cart),
        label: 'Panier',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.person),
        label: 'Profil',
      ),
    ];

    // Ajoute l'option Déconnexion **seulement si l'utilisateur est connecté**
    if (isLoggedIn) {
      items.add(
        const BottomNavigationBarItem(
          icon: Icon(Icons.logout, color: Colors.red),
          label: 'Déconnexion',
        ),
      );
    }
    return items;
  }

  // Navigation sur le menu en fonction de l'option sélectionnée
  void _navigateToPage(BuildContext context, int index) async {
    final authProvider = Provider.of<AuthentificationProvider>(context, listen: false);
    final bool isLoggedIn = authProvider.isUserLoggedIn(); // Vérifie si l'utilisateur est connecté

    // Ajustement de l'index pour empêcher l'accès à la déconnexion si l'utilisateur n'est pas connecté
    if (!isLoggedIn && index == 7) {
      return;
    }

    switch (index) {
      case 0: // Accueil
        Navigator.pushNamed(context, '/home');
        break;
      case 1: // Produits
        Navigator.pushNamed(context, '/products');
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
      case 6: // Profil - C'est via celui-ci qu'une personne peut se connecter ou s'inscrire
        if (authProvider.isAuthenticated) {
          // Si l'utilisateur est connecté, aller à la page profil
          Navigator.pushNamed(context, '/profile');
        } else {
          // Si l'utilisateur n'est pas connecté, aller à la page de connexion
          Navigator.pushNamed(context, '/login');
        }
        break;
      case 7: // Déconnexion avec confirmation
        if (isLoggedIn) {
          bool confirm = await authProvider.confirmLogout(context);
          if (confirm) {
            await authProvider.logout();
            Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false); // Redirige vers la page d'accueil après la déconnexion
          }
        }
        break;
      default:
        break;
    }
  }
}