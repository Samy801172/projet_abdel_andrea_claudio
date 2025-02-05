// Classe pour éviter d'écrire à plusieurs endroits l'URL de l'API donc création
// d'une classe Config pour pourvoir appeller mon API URL.

class Config {
  static const String baseUrl = 'http://localhost:2024/api'; // => TEST SUR PC EN LOCAL
  // static const String _baseUrl = "http://192.168.0.162:2024/api"; // => TEST SUR UN SMARTPHONE CONNECTE
  // static const String baseUrl = 'http://10.0.2.2:2024/api'; // => TEST SUR EMULATEUR ANDROID
  // Client PayPal
  static const String paypalClientId = 'AYu0FhU6VKkIsk_x3DYp3ZDBn57Z0JnrYQJShGFcg3DRIquZzZIv0kBEiHw1dNKx2-enGPHWzyfUEtwM';
  static const String paypalMode = 'sandbox';  // Mode sandbox ou live

  // Points de terminaison
  static const Map<String, String> endpoints = {
    'products': '/products',
    'stock': '/stock',
    'payments': '/payments',
    'orders': '/orders',
    'auth': '/auth',
    'users': '/users',
    'promotions': '/promotions',
  };

// Configuration de la base de données
  static const Map<String, String> dbConfig = {
    'host': '127.0.0.1',
    'port': '5432',
    'database': 'pwd_ser4001',
    'username': 'pwd_user4001',
    'password': 'P@ssword4001',
  };

}