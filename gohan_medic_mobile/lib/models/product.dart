class Product {
  final int idProduct;
  final String name;
  final String description;
  final double price;
  final int stock;
  final bool active;
  final bool requiresPrescription;
  final bool requiresManufacturing;

  Product({
    required this.idProduct,
    required this.name,
    required this.description,
    required this.price,
    required this.stock,
    required this.active,
    this.requiresPrescription = false,
    this.requiresManufacturing = false,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      idProduct: json['id_product'],
      name: json['name'],
      description: json['description'],
      price: double.parse(json['price'].toString()),
      stock: json['stock'],
      active: json['active'],
      requiresPrescription: json['requiresPrescription'] ?? false,
      requiresManufacturing: json['requiresManufacturing'] ?? false,
    );
  }
} 