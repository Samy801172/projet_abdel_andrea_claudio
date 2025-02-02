import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Pages/ProfilePage.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/CommandeList.dart';
import 'Pages/HomePage.dart';
import 'Pages/LoginPage.dart';
import 'Pages/RegisterPage.dart';
import 'package:provider/provider.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/CartProvider.dart';
import 'package:gohanmedic_flutterprojetmobile/Pages/CartPage.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/AuthentificationProvider.dart';

void main() {
  runApp(
    MultiProvider( // Utilisation de MultiProvider pour inclure la gestion de l'état global
      providers: [
        ChangeNotifierProvider(create: (context) => AuthentificationProvider()),
        ChangeNotifierProvider(create: (context) => CartProvider()), // Ajout du provider pour gérer le panier
      ],
      child: GohanMedicApp(),
    ),
  );
}


class GohanMedicApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'GohanMedic',
      theme: ThemeData(
        primarySwatch: Colors.green,
        scaffoldBackgroundColor: Colors.green[50],
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.green[700],
          foregroundColor: Colors.white,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green[600],
            foregroundColor: Colors.white,
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: Colors.green[800],
          ),
        ),
      ),

        initialRoute: '/',
        routes: {
          // Route vers la page de connexion.
          '/': (context) => LoginPage(),
          // Route vers la page d'inscription.
          '/register': (context) => RegisterPage(),
          // Route vers la page d'accueil qui affiche les produits du moment et les promotions, ...
          '/home': (context) => HomePage(),
          '/commande': (context) {
            // Récupérer l'ID utilisateur de AuthentificationProvider
            final userId = Provider.of<AuthentificationProvider>(context, listen: false).userId;
            return CommandeList(userId: userId);
          },
        // Route vers la page du panier.
        '/cart': (context) => CartPage(),
        // Route vers la page du profil utilisateur.
        '/profile': (context) => ProfilePage(),
      },
    );
  } // Build
}
