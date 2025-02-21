import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PaypalWebView extends StatefulWidget {
  final String orderId;
  final double amount;

  const PaypalWebView({
    super.key,
    required this.orderId,
    required this.amount,
  });

  @override
  State<PaypalWebView> createState() => _PaypalWebViewState();
}

class _PaypalWebViewState extends State<PaypalWebView> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (request) {
            if (request.url.contains('success')) {
              Navigator.pop(context, 'success');
              return NavigationDecision.prevent;
            }
            if (request.url.contains('cancel')) {
              Navigator.pop(context, 'cancel');
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(
        Uri.parse('http://localhost:2024/api/payment/paypal/checkout?orderId=${widget.orderId}'),
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PayPal Checkout'),
      ),
      body: WebViewWidget(controller: _controller),
    );
  }
} 