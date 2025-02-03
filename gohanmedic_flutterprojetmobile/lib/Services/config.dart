// Classe pour éviter d'écrire à plusieurs endroits l'URL de l'API donc création
// d'une classe Config pour pourvoir appeller mon API URL.

class Config {
// static const String apiUrl = "http://localhost:2024/api"; // => TEST SUR PC EN LOCAL
// static const String apiUrl = "http://192.168.0.162:2024/api"; // => TEST SUR UN SMARTPHONE CONNECTE
static const String apiUrl = "http://10.0.2.2:2024/api"; // => TEST SUR EMULATEUR ANDROID
}