import 'package:flutter/material.dart';
import '../services/cart_service.dart';
import '../services/payment_service.dart';
import 'package:webview_flutter/webview_flutter.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final CartService _cartService = CartService();
  final PaymentService _paymentService = PaymentService();
  bool _isLoading = false;
  String? _paypalOrderId;

  @override
  void initState() {
    super.initState();
    _loadCart();
  }

  Future<void> _loadCart() async {
    await _cartService.loadCart();
    setState(() {});
  }

  Future<void> _processPayment() async {
    setState(() => _isLoading = true);
    try {
      // Créer l'ordre PayPal
      _paypalOrderId = await _paymentService.createPaypalOrder(_cartService.total);
      
      // Afficher la page de paiement PayPal
      if (mounted) {
        final result = await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PaypalWebView(
              orderId: _paypalOrderId!,
              amount: _cartService.total,
            ),
          ),
        );

        if (result == 'success') {
          // Capturer le paiement
          await _paymentService.capturePaypalPayment(_paypalOrderId!);
          
          // Vider le panier
          await _cartService.clearCart();
          
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Paiement réussi!')),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    }
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon Panier'),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _cartService.items.length,
              itemBuilder: (context, index) {
                final item = _cartService.items[index];
                return ListTile(
                  title: Text(item.nom),
                  subtitle: Text('${item.prix} € x ${item.quantite}'),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete),
                    onPressed: () async {
                      await _cartService.removeFromCart(item.id);
                      setState(() {});
                    },
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Text(
                  'Total: ${_cartService.total.toStringAsFixed(2)} €',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _cartService.items.isEmpty || _isLoading 
                    ? null 
                    : _processPayment,
                  child: _isLoading
                    ? const CircularProgressIndicator()
                    : const Text('Payer'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
} 