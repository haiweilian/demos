import 'package:flutter/material.dart';
import 'package:flutter_study_demo/manager/ManagerScreen.dart';
import 'package:flutter_study_demo/find/FindScreen.dart';
import 'package:flutter_study_demo/mine/MineScreen.dart';
import 'package:flutter_study_demo/trend/TrendScreen.dart';

class FlowerApp extends StatefulWidget {
  FlowerApp({Key key}) : super(key: key);

  @override
  _FlowerAppState createState() => _FlowerAppState();
}

class _FlowerAppState extends State<FlowerApp> {

  final List<Widget> _children = [
    TrendScreen(),
    FindScreen(),
    ManagerScreen(),
    MineScreen()
  ];

  int _currentIndex = 0;

  final List<BottomNavigationBarItem> _itemList = [
    BottomNavigationBarItem(
      icon: Image.asset(
        'assets/images/invite_normal.png',
        width: 24,
        height: 24
      ),
      title: Text('好友'),
      activeIcon: Image.asset(
        'assets/images/invite_selected.png',
        width: 24,
        height: 24
      )
    ),
    BottomNavigationBarItem(
      icon: Image.asset(
        'assets/images/discovery_normal.png',
        width: 24,
        height: 24
      ),
      title: Text('发现'),
      activeIcon: Image.asset(
        'assets/images/discovery_selected.png',
        width: 24,
        height: 24
      )
    ),
    BottomNavigationBarItem(
      icon: Image.asset(
        'assets/images/manager_normal.png',
        width: 24,
        height: 24
      ),
      title: Text('管理'),
      activeIcon: Image.asset(
        'assets/images/manager_selected.png',
        width: 24,
        height: 24
      )
    ),
    BottomNavigationBarItem(
      icon: Image.asset(
        'assets/images/mine_normal.png',
        width: 24,
        height: 24
      ),
      title: Text('我的'),
      activeIcon: Image.asset(
        'assets/images/mine_selected.png',
        width: 24,
        height: 24
      )
    ),
  ];

  onTapAction(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _children[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Color.fromARGB(255, 242, 89, 63),
        unselectedItemColor: Colors.grey,
        currentIndex: _currentIndex,
        onTap: onTapAction,
        items: _itemList,
      ),
    );
  }
}
