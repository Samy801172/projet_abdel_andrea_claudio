class Env {
  // URL de base de l'API
  static const String apiUrl = 'http://127.0.0.1:2024/api';  // Pour le développement local
  // ou utilisez l'IP de votre machine si vous accédez depuis un autre appareil
  // static const String apiUrl = 'http://192.168.1.xxx:2024/api';  // Remplacez xxx par votre IP locale
  
  // Endpoints
  static const String loginEndpoint = '/account/signin';
  static const String signupEndpoint = '/account/signup';
  static const String refreshTokenEndpoint = '/account/refresh';
  static const String meEndpoint = '/account/me';
  
  // Clés de stockage
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  
  // Configuration PayPal
  static const String paypalApiUrl = 'https://api-m.sandbox.paypal.com';
  static const String paypalClientId = 'AYu0FhU6VKkIsk_x3DYp3ZDBn57Z0JnrYQJShGFcg3DRIquZzZIv0kBEiHw1dNKx2-enGPHWzyfUEtwM';

  // Headers par défaut
  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  // Configuration de l'application
  static const String appName = 'Gohan Medic';
  static const String appVersion = '1.0.0';

  // Informations de connexion de test
  static const Map<String, String> testCredentials = {
    'username': 'client01',
    'mail': 'client01@hotmail.be',
    'password': r'$2b$10$hsBmueDwRyci85B59JEQf.jGTUnE3MBEktdrdn9iX9gem6t/hJ0Nm',
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