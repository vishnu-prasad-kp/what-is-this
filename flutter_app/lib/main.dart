import 'package:flutter/material.dart';
import 'pages/home_page.dart';

void main() {
  runApp(const WhatIsThisApp());
}

class WhatIsThisApp extends StatelessWidget {
  const WhatIsThisApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'What Is This?',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(
          primary: Color.fromARGB(255, 45, 156, 255),
        ),
        useMaterial3: true,
        textTheme: const TextTheme(
          displayLarge: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            fontFamily: 'Inter',
          ),
        ),
      ),
      home: const HomePage(),
    );
  }
}
