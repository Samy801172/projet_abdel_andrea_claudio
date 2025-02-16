import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:gohanmedic_flutterprojetmobile/Widgets/Design/BaseLayout.dart';
import 'package:intl/intl.dart';

class PrescriptionPage extends StatefulWidget {
  @override
  _PrescriptionPageState createState() => _PrescriptionPageState();
}

class _PrescriptionPageState extends State<PrescriptionPage> {
  File? _selectedFile;
  DateTime? _expirationDate;

  // 📂 Sélectionner un fichier PDF
  Future<void> _pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );

    if (result != null && result.files.isNotEmpty) {
      setState(() {
        _selectedFile = File(result.files.single.path!);
        _expirationDate = DateTime.now().add(Duration(days: 7)); // ✅ Expiration après 7 jours
      });

      print("📂 Fichier sélectionné: ${_selectedFile!.path}");
      print("📅 Expiration prévue: ${DateFormat('dd/MM/yyyy').format(_expirationDate!)}");
    }
  }

  // 🗑️ Supprimer le fichier sélectionné
  void _removeFile() {
    setState(() {
      _selectedFile = null;
      _expirationDate = null;
    });
    print("🗑️ Fichier supprimé");
  }

  // 📡 Envoyer l'ordonnance à l'API (À compléter selon ton backend)
  Future<void> _uploadPrescription() async {
    if (_selectedFile == null) {
      print("❌ Aucun fichier sélectionné !");
      return;
    }

    print("📡 Envoi du fichier ${_selectedFile!.path} à l'API...");
    print("📅 Expiration: ${DateFormat('dd/MM/yyyy').format(_expirationDate!)}");

    // ⚠️ Ajouter ici la logique d'envoi à ton API
  }

  @override
  Widget build(BuildContext context) {
    int daysRemaining = _expirationDate != null
        ? _expirationDate!.difference(DateTime.now()).inDays
        : 0;

    Color expirationColor = daysRemaining <= 2 ? Colors.red : Colors.orange;

    return BaseLayout(
      title: 'Déposer une ordonnance',
      requireAuthentication: false,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 📌 Encadré d'information
            Container(
              padding: EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.info, color: Colors.blue),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      "Votre ordonnance sera valide uniquement pendant 7 jours après son dépôt.",
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: 20),

            // 📌 Bouton pour sélectionner un fichier
            ElevatedButton.icon(
              onPressed: _pickFile,
              icon: Icon(Icons.upload_file),
              label: Text('Sélectionner un fichier PDF'),
            ),

            SizedBox(height: 20),

            // 📄 Affichage du fichier sélectionné
            if (_selectedFile != null) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      "📄 Fichier: ${_selectedFile!.path.split('/').last}",
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.delete, color: Colors.red),
                    onPressed: _removeFile,
                  ),
                ],
              ),
              SizedBox(height: 10),

              // 📅 Date d'expiration + Couleur d'alerte
              Container(
                padding: EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: expirationColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: expirationColor),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning, color: expirationColor),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        daysRemaining > 0
                            ? "⏳ Il vous reste $daysRemaining jour(s) avant expiration."
                            : "⚠️ Cette ordonnance est expirée !",
                        style: TextStyle(fontWeight: FontWeight.bold, color: expirationColor),
                      ),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 20),

              // 📡 Bouton d'envoi
              ElevatedButton(
                onPressed: _uploadPrescription,
                child: Text("Envoyer l'ordonnance"),
              ),
            ],
          ],
        ),
      ),
    );
  }
}