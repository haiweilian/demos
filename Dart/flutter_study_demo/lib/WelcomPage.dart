import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_study_demo/Application.dart';
import 'package:flutter_study_demo/home.dart';

class WelcomPage extends StatefulWidget {
  WelcomPage({Key key}) : super(key: key);

  @override
  _WelcomPageState createState() => _WelcomPageState();
}

class _WelcomPageState extends State<WelcomPage> {

  int counter = 5;

  Timer _timer;

  @override
  void initState() {
    super.initState();

    _timer = Timer.periodic(Duration(seconds: 1), (timer) {
      if (counter == 1) {
        _timer.cancel();
        _timer = null;
        goHomePage();
      }
      setState(() {
        counter = --counter;
      });
    });
  }

  goHomePage() {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => FlowerApp()),
      (route) => route == null
    );
  }

  @override
  Widget build(BuildContext context) {

    // 初始化屏幕数据到全局
    final media = MediaQuery.of(context);
    Application.screenWidth = media.size.width;
    Application.screenHeight = media.size.height;
    Application.statusBarHeight = media.padding.top;
    Application.bottomBarHeight = media.padding.bottom;

    return Scaffold(
      body: Stack(
        children: <Widget>[
          Container(
            margin: EdgeInsets.zero,
            child: Image.asset(
              'assets/images/SplashBgImage.jpg',
              height: Application.screenHeight,
              fit: BoxFit.cover,
            ),
          ),
          Positioned(
            top: Application.statusBarHeight,
            right: 20,
            child: Chip(
              label: Text('$counter 秒'),
              backgroundColor: Colors.transparent,
            )
          )
        ],
      ),
    );
  }
}
