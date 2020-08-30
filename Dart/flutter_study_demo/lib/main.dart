import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_study_demo/WelcomPage.dart';
import 'package:flutter_study_demo/provider/find_list.dart';

void main() => runApp(
  MultiProvider(
    providers: [
      ChangeNotifierProvider(create: (_) => FindListProvider())
    ],
    child: MyApp(),
  ),
);

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: WelcomPage()
    );
  }
}
