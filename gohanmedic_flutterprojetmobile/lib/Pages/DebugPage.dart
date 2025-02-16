import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/Design/BaseLayout.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DebugPage extends StatefulWidget {
  @override
  _DebugPageState createState() => _DebugPageState();
}

class _DebugPageState extends State<DebugPage> {
  String? token;
  String? clientId;

  @override
  void initState() {
    super.initState();
    loadStoredData(); // Charge les données stockées
  }

  Future<void> loadStoredData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      token = prefs.getString('token');
      clientId = prefs.getString('clientId');
    });

    print("📥 Données stockées : Token = $token, ClientID = $clientId");
  }

  Future<void> clearStoredData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear(); // Supprime toutes les données stockées
    print("🗑️ Données effacées !");
    setState(() {
      token = null;
      clientId = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return  BaseLayout(
      title: "DebugStockage",
      requireAuthentication: false, //accessible sans connexion
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("🔑 Token : ${token ?? 'Aucun'}", style: TextStyle(fontSize: 16)),
            SizedBox(height: 10),
            Text("🆔 Client ID : ${clientId ?? 'Aucun'}", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: loadStoredData,
              child: Text("🔄 Recharger les données"),
            ),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: clearStoredData,
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: Text("🗑️ Réinitialiser stockage"),
            ),
            ElevatedButton(
              onPressed: () async {
                SharedPreferences prefs = await SharedPreferences.getInstance();
                await prefs.clear();
                print("🗑️ [DEBUG] Données locales effacées !");
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: Text("✅ Données locales effacées !"),
                  backgroundColor: Colors.green,
                ));
              },
              child: Text("Réinitialiser les données"),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            ),
          ],
        ),
      ),
    );
  }
}
