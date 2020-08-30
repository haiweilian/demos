import 'package:flutter/material.dart';

class ThirdScreen extends StatefulWidget {
  @override
  _ThirdScreenState createState() => _ThirdScreenState();
}

class _ThirdScreenState extends State<ThirdScreen> {
  int _count = 0;
  void _increaseCount() {
    setState(() {
      _count += 1;
    });
  }

  @override
  Widget build(BuildContext context) {
    return CounterProvider(
      count: _count,
      increaseCount: _increaseCount,
      child: Scaffold(
        appBar: AppBar(title: Text('InheritedWidget')),
        body: MiddleCount(),
        floatingActionButton: FloatingActionButton(
          child: Icon(Icons.add),
          onPressed: _increaseCount,
        ),
      ),
    );
  }
}

class MiddleCount extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: Center(
        child: Counter(),
      ),
    );
  }
}

class Counter extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final count = CounterProvider.of(context).count;
    final increaseCount = CounterProvider.of(context).increaseCount;
    return Center(
      child: GestureDetector(
      onTap: increaseCount,
      child: Text(
        '$count',
        style: TextStyle(fontSize: 30),
      ),
    ));
  }
}

class CounterProvider extends InheritedWidget {
  final int count;
  final VoidCallback increaseCount;
  final Widget child;

  CounterProvider({this.child, this.count, this.increaseCount});

  static CounterProvider of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<CounterProvider>();
  }

  @override
  bool updateShouldNotify(InheritedWidget oldWidget) {
    return true;
  }
}
