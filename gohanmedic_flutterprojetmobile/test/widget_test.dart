// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/AuthentificationProvider.dart';
import 'package:gohanmedic_flutterprojetmobile/Provider/CartProvider.dart';
import 'package:gohanmedic_flutterprojetmobile/main.dart';
import 'package:provider/provider.dart';

void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    // 🔄 Crée des instances des providers requis
    final authProvider = AuthentificationProvider();
    final cartProvider = CartProvider();

    // ⚡️ Injecte les providers dans l'application de test
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => authProvider),
          ChangeNotifierProvider(create: (_) => cartProvider),
        ],
        child: GohanMedicApp(authProvider: authProvider, cartProvider: cartProvider),
      ),
    );

    // 📌 Vérifie que le compteur commence à 0
    expect(find.text('0'), findsOneWidget);
    expect(find.text('1'), findsNothing);

    // 🔘 Simule un clic sur l'icône "+"
    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();

    // ✅ Vérifie que le compteur est bien passé à 1
    expect(find.text('0'), findsNothing);
    expect(find.text('1'), findsOneWidget);
  });
}
