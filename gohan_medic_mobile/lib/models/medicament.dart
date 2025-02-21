class Medicament {
  final int id;
  final String nom;
  final String description;
  final double prix;
  final String image;
  final int stock;

  const Medicament({
    required this.id,
    required this.nom,
    required this.description,
    required this.prix,
    required this.image,
    required this.stock,
  });

  factory Medicament.fromJson(Map<String, dynamic> json) {
    return Medicament(
      id: json['id'],
      nom: json['nom'],
      description: json['description'],
      prix: json['prix'].toDouble(),
      image: json['image'],
      stock: json['stock'],
    );
  }
} 