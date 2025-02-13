import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Pages/DebugPage.dart';
import 'package:gohanmedic_flutterprojetmobile/Pages/ProfilePage.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/CommandeList.dart';
import 'package:gohanmedic_flutterprojetmobile/Pages/ProductPage.dart';
import 'Pages/HomePage.dart';
import 'Pages/LoginPage.dart';
import 'Pages/RegisterPage.dart';
import 'package:provider/provider.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/CartProvider.dart';
import 'package:gohanmedic_flutterprojetmobile/Pages/CartPage.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/AuthentificationProvider.dart';
import 'Services/config.dart';
import 'package:gohanmedic_flutterprojetmobile/Pages/DebugPage.dart'; // 📌 Import de DebugPage


void main() {
  print("🛠️ API URL utilisée : ${Config.apiUrl}"); // Vérifie dans la console
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


// Classe principale de l'application
class GohanMedicApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'GohanMedic',
      home: DebugPage(),
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

      // On commence sur HomePage, qu'il soit connecté ou non
        initialRoute: '/DebugStockage',
        routes: {
          "/DebugStockage": (context) => DebugPage(), // Ajoute cette ligne
          // Route vers la page de connexion.
          '/login': (context) => LoginPage(),

          // Route vers la page d'inscription.
          '/register': (context) => RegisterPage(),

          // Route vers la page d'accueil qui affiche les produits du moment et les promotions, ...
          '/home': (context) => HomePage(),

          //Route vers la liste des commandes (Vérification si l'utilisateur est connecté sinon redirection vers connexion
          '/commande': (context) {
            // Récupérer l'ID utilisateur de AuthentificationProvider
            final authentificationprovider = Provider.of<AuthentificationProvider>(context, listen: false);
            final clientId = authentificationprovider.clientId;

            if (clientId == null) {
              // Rediriger vers la page de connexion
              Future.microtask(() => Navigator.pushReplacementNamed(context, '/login'));
              return Scaffold(
                body: Center(child: CircularProgressIndicator()), // Affichage temporaire
              );
            }
            return CommandeList(clientId: clientId);
          },

        // Route vers la page du panier.
        '/cart': (context) => CartPage(),

        //Route vers la page des médicaments.
        '/products': (context) => ProductPage(),

        // Route vers la page du profil utilisateur.
        '/profile': (context) => ProfilePage(),
      },
    );
  } // Build
}
