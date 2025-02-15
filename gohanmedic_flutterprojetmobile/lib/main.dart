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

void main() async {
  WidgetsFlutterBinding.ensureInitialized(); // ⚙ Assure l'initialisation correcte de Flutter

  print("🛠️ API URL utilisée : ${Config.apiUrl}"); // ✅ Vérification de l'URL API

  final authProvider = AuthentificationProvider(); // 🔑 Création du provider d'authentification
  await authProvider.loadUser(); // 🔄 Chargement des infos utilisateur stockées

  final cartProvider = CartProvider(); // 🛒 Création du provider pour gérer le panier

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => authProvider), // Provider pour l'authentification
        ChangeNotifierProvider(create: (context) => cartProvider), // Provider pour le panier
      ],
      child: GohanMedicApp(authProvider: authProvider, cartProvider: cartProvider),
    ),
  );
}

class GohanMedicApp extends StatefulWidget {
  final AuthentificationProvider authProvider;
  final CartProvider cartProvider;

  GohanMedicApp({required this.authProvider, required this.cartProvider});

  @override
  _GohanMedicAppState createState() => _GohanMedicAppState();
}

class _GohanMedicAppState extends State<GohanMedicApp> {
  @override
  void initState() {
    super.initState();

    // 🔄 Charge le panier après le premier `build()`
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (widget.authProvider.clientId != null) {
        int? clientIdInt;
        try {
          clientIdInt = int.parse(widget.authProvider.clientId!); // 🔢 Conversion String -> int
          print("✅ Client ID converti en int : $clientIdInt");

          // 📡 Chargement du panier depuis l'API
          await widget.cartProvider.fetchCartFromServer(clientIdInt, context);
        } catch (e) {
          print("❌ Erreur de conversion du client ID : $e");
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false, // ❌ Supprime le bandeau "Debug"
      title: 'GohanMedic', // 🏷 Titre de l'application

      // 🎨 **Thème global de l'application**
      theme: ThemeData(
        primarySwatch: Colors.green, // 🌿 Couleur principale
        scaffoldBackgroundColor: Colors.green[50], // 🏠 Fond général
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.green[700], // 🎨 Couleur de l'AppBar
          foregroundColor: Colors.white, // 📌 Texte et icônes de l'AppBar
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green[600], // ✅ Boutons colorés
            foregroundColor: Colors.white, // 🏷 Texte blanc
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: Colors.green[800], // 🟢 Boutons texte en vert foncé
          ),
        ),
      ),

      // 📍 **Page de démarrage** - Debug uniquement (Changer pour `/home` en version finale)
      initialRoute: '/DebugStockage',

      // 🛣️ **Définition des routes**
      routes: {
        "/DebugStockage": (context) => DebugPage(), // 🐞 Page de debug
        '/login': (context) => LoginPage(), // 🔑 Page de connexion
        '/register': (context) => RegisterPage(), // 📝 Page d'inscription
        '/home': (context) => HomePage(), // 🏠 Page d'accueil
        '/cart': (context) => CartPage(), // 🛒 Page du panier
        '/products': (context) => ProductPage(), // 💊 Page des médicaments
        '/profile': (context) => ProfilePage(), // 🧑‍⚕️ Page du profil utilisateur

        // 📦 **Route vers la liste des commandes (avec redirection si non connecté)**
        '/commande': (context) {
          final authProvider = Provider.of<AuthentificationProvider>(context, listen: false);
          final clientId = authProvider.clientId; // 🔑 Récupération du client ID

          if (clientId == null) {
            print("🔒 Redirection vers la connexion : utilisateur non authentifié !");
            Future.microtask(() => Navigator.pushReplacementNamed(context, '/login'));
            return Scaffold(
              body: Center(child: CircularProgressIndicator()), // ⏳ Affichage temporaire
            );
          }

          print("✅ Chargement des commandes pour le client ID: $clientId");
          return CommandeList(clientId: clientId);
        },
      },
    );
  }
}