import 'package:flutter/material.dart';

class LoadingIndicator extends StatelessWidget {
  final Color color;
  
  const LoadingIndicator({
    super.key,
    this.color = Colors.white,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 24,
      width: 24,
      child: CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation<Color>(color),
        strokeWidth: 2.5,
      ),
    );
  }
} 