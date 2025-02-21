class User {
  final int id;
  final String email;
  final String nom;
  final String prenom;
  final String? telephone;
  final String? adresse;

  User({
    required this.id,
    required this.email,
    required this.nom,
    required this.prenom,
    this.telephone,
    this.adresse,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      nom: json['nom'],
      prenom: json['prenom'],
      telephone: json['telephone'],
      adresse: json['adresse'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'nom': nom,
      'prenom': prenom,
      'telephone': telephone,
      'adresse': adresse,
    };
  }
} 