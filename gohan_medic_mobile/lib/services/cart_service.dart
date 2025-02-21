import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/cart_item.dart';

class CartService {
  static const String cartKey = 'cart_items';
  List<CartItem> _items = [];

  List<CartItem> get items => _items;
  
  double get total => _items.fold(0, (sum, item) => sum + item.total);

  Future<void> addToCart(CartItem item) async {
    final existingItem = _items.firstWhere(
      (i) => i.id == item.id,
      orElse: () => item,
    );

    if (_items.contains(existingItem)) {
      existingItem.quantite++;
    } else {
      _items.add(item);
    }
    await _saveCart();
  }

  Future<void> removeFromCart(int id) async {
    _items.removeWhere((item) => item.id == id);
    await _saveCart();
  }

  Future<void> _saveCart() async {
    final prefs = await SharedPreferences.getInstance();
    final String cartJson = json.encode(
      _items.map((item) => {
        'id': item.id,
        'nom': item.nom,
        'prix': item.prix,
        'quantite': item.quantite,
      }).toList(),
    );
    await prefs.setString(cartKey, cartJson);
  }

  Future<void> loadCart() async {
    final prefs = await SharedPreferences.getInstance();
    final String? cartJson = prefs.getString(cartKey);
    if (cartJson != null) {
      final List<dynamic> decoded = json.decode(cartJson);
      _items = decoded.map((item) => CartItem(
        id: item['id'],
        nom: item['nom'],
        prix: item['prix'],
        quantite: item['quantite'],
      )).toList();
    }
  }
} 