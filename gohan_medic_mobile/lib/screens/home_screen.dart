import 'package:flutter/material.dart';
import '../models/medicament.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _apiService = ApiService();
  List<Medicament> _medicaments = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _chargerMedicaments();
  }

  Future<void> _chargerMedicaments() async {
    setState(() => _isLoading = true);
    try {
      final medicaments = await _apiService.getMedicaments();
      setState(() {
        _medicaments = medicaments;
        _isLoading = false;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erreur de chargement des données')),
      );
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gohan Medic'),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_cart),
            onPressed: () {
              // Navigation vers le panier
            },
          ),
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _chargerMedicaments,
            child: ListView.builder(
              itemCount: _medicaments.length,
              itemBuilder: (context, index) {
                final medicament = _medicaments[index];
                return Card(
                  margin: const EdgeInsets.all(8),
                  child: ListTile(
                    leading: Image.network(
                      medicament.image,
                      width: 50,
                      height: 50,
                      fit: BoxFit.cover,
                    ),
                    title: Text(medicament.nom),
                    subtitle: Text('${medicament.prix} €'),
                    trailing: IconButton(
                      icon: const Icon(Icons.add_shopping_cart),
                      onPressed: () {
                        // Ajouter au panier
                      },
                    ),
                  ),
                );
              },
            ),
          ),
    );
  }
} 