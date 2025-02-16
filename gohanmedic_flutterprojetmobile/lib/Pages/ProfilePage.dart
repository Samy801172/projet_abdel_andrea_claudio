// Page pour le profil d'un client + lien vers sa liste de commande (avec notifcation de changement)
// commande avec médicament sur mesure aussi

import 'dart:convert';
import 'package:http_parser/http_parser.dart';
import 'package:flutter/material.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/Design/BaseLayout.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import '../Services/apiservice.dart';
import '../Services/config.dart';
import 'package:provider/provider.dart';
import '../Provider/AuthentificationProvider.dart';


class ProfilePage extends StatefulWidget {
  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  String? firstName;
  String? lastName;
  String? address;
  String? email;
  String? avatarUrl;
  String? username;
  bool isLoading = true;
  late int clientId;

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  // 📡 **Charger les infos du client**
  Future<void> _loadProfileData() async {
    try {
      final authProvider = Provider.of<AuthentificationProvider>(context, listen: false);

      if (authProvider.clientId == null || authProvider.token == null) {
        print("❌ Erreur : Aucun client ID ou token disponible !");
        return;
      }

      int clientId = int.parse(authProvider.clientId!); // 🔄 Convertir en `int`
      print("📡 [API] Chargement du profil pour client ID: $clientId...");

      final profileData = await ApiService.fetchProfile();

      if (profileData == null) {
        print("❌ Erreur : Impossible de récupérer le profil !");
        return;
      }

      setState(() {
        firstName = profileData['firstName'] ?? "";
        lastName = profileData['lastName'] ?? "";
        address = profileData['address'] ?? "";
        email = profileData['credential']['mail'] ?? "";
        username = profileData['credential']['username'] ?? "";
        avatarUrl = profileData['avatar'] != null && profileData['avatar'] != "/assets/uploads/default.jpg"
            ? Config.apiUrl + profileData['avatar']
            : "https://via.placeholder.com/150"; // 📸 Image par défaut
        isLoading = false;
      });

      print("✅ [API] Profil chargé avec succès !");
    } catch (e) {
      print("❌ Erreur lors du chargement du profil : $e");
    }
  }

  // 📝 **Mettre à jour le profil**
  Future<void> _updateProfile() async {
    if (firstName!.isEmpty || lastName!.isEmpty || address!.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text("⚠️ Remplissez tous les champs avant d'enregistrer."),
        backgroundColor: Colors.orange,
      ));
      return;
    }

    try {
      final response = await http.put(
        Uri.parse('${Config.apiUrl}/clients/$clientId/updateProfile'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          "firstName": firstName,
          "lastName": lastName,
          "address": address,
        }),
      );

      if (response.statusCode == 200) {
        print("✅ [API] Profil mis à jour avec succès !");
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("✅ Profil mis à jour !")));
      } else {
        print("❌ [API] Erreur de mise à jour: ${response.body}");
      }
    } catch (e) {
      print("❌ Erreur mise à jour: $e");
    }
  }

  // 📸 **Modifier l'avatar**
  // 📸 **Modifier l'avatar**
  Future<void> _uploadAvatar() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile == null) return;

    try {
      final uri = Uri.parse('${Config.apiUrl}/clients/profile/$clientId/avatar');
      var request = http.MultipartRequest('POST', uri);

      request.files.add(await http.MultipartFile.fromPath(
        'avatar',
        pickedFile.path, // ✅ Utilisation du chemin du fichier
        contentType: MediaType('image', 'jpeg'), // 🏷️ Définit le type d'image
      ));

      request.headers.addAll({'Authorization': 'Bearer ${await ApiService.getValidToken()}'});

      var response = await request.send();

      if (response.statusCode == 200) {
        print("✅ [API] Avatar mis à jour avec succès !");
        _loadProfileData(); // 🔄 Recharge les données après l'upload
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("📸 Avatar mis à jour !")),
        );
      } else {
        print("❌ [API] Erreur lors de l'upload de l'avatar : ${response.reasonPhrase}");
      }
    } catch (e) {
      print("❌ Erreur avatar: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return BaseLayout(
      title: "Mon Profil",
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // 📸 **Image de profil**
            GestureDetector(
              onTap: _uploadAvatar,
              child: CircleAvatar(
                radius: 50,
                backgroundImage: NetworkImage(avatarUrl!),
                child: avatarUrl == "https://via.placeholder.com/150"
                    ? Icon(Icons.camera_alt, size: 30, color: Colors.white) // 📸 Icône si image par défaut
                    : null,
              ),
            ),
            SizedBox(height: 10),
            Text(username ?? "", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text(email ?? "", style: TextStyle(fontSize: 14, color: Colors.grey)),

            SizedBox(height: 20),

            // 📝 **Formulaire de mise à jour**
            TextField(
              decoration: InputDecoration(labelText: "Prénom"),
              onChanged: (value) => firstName = value,
              controller: TextEditingController(text: firstName),
            ),
            TextField(
              decoration: InputDecoration(labelText: "Nom"),
              onChanged: (value) => lastName = value,
              controller: TextEditingController(text: lastName),
            ),
            TextField(
              decoration: InputDecoration(labelText: "Adresse"),
              onChanged: (value) => address = value,
              controller: TextEditingController(text: address),
            ),

            SizedBox(height: 20),

            // 💾 **Bouton de mise à jour**
            ElevatedButton(
              onPressed: _updateProfile,
              child: Text("Mettre à jour"),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            ),

            SizedBox(height: 20),

            // 📦 **Accès aux commandes**
            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, '/commande');
              },
              child: Text("Voir mes commandes"),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
            ),
          ],
        ),
      ),
    );
  }
}