class CartItem {
  final int id;
  final String nom;
  final double prix;
  int quantite;

  CartItem({
    required this.id,
    required this.nom,
    required this.prix,
    this.quantite = 1,
  });

  double get total => prix * quantite;
} 