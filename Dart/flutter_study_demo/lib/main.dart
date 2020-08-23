import 'package:flutter/material.dart';
import 'package:flutter_study_demo/pages/ChannelScreen.dart';
import 'package:flutter_study_demo/pages/HomeScreen.dart';
import 'package:flutter_study_demo/pages/UserScreen.dart';

void main() {
  runApp(MyApp());
}

// ==== StatelessWidget 无状态类
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      home: RootContainer(),
    );
  }
}

// ==== StatefulWidget 有状态类
class RootContainer extends StatefulWidget {
  RootContainer({Key key}) : super(key: key);

  @override
  _RootContainerState createState() => _RootContainerState();
}

class _RootContainerState extends State<RootContainer> {

  // 定义界面容器
  final List<Widget> _children = [
    HomeScreen(),
    ChannelScreen(),
    UserScreen()
  ];

  int _currentIndex = 0;

  void onTapChange(int selectIndex) {
    setState(() {
      _currentIndex = selectIndex;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: _children[_currentIndex],
      drawer: Drawer(
        child: Center(
          child: Text(
            'Drawer'
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        onTap: onTapChange,
        currentIndex: _currentIndex,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            title: Text('首页')
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.subscriptions),
            title: Text('频道')
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.child_care),
            title: Text('我的')
          )
        ]
      ),
    );
  }
}
