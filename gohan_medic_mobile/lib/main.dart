import 'package:flutter/material.dart';
import 'package:gohan_medic_mobile/screens/auth/login_screen.dart';
import 'package:gohan_medic_mobile/theme/app_theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gohan Medic',
      theme: AppTheme.light,
      home: const LoginScreen(),
      debugShowCheckedModeBanner: false,
      routes: {
        '/login': (context) => const LoginScreen(),
        // Ajoutez vos autres routes ici
      },
    );
  }
} 