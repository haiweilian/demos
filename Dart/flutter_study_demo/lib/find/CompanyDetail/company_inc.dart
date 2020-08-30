import 'package:flutter/material.dart';

class CompanyInc extends StatelessWidget {
  const CompanyInc({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Center(
        child: Text(
          'CompanyInc',
          style: TextStyle(
            fontSize: 30,
            color: Colors.red
          ),
        ),
      )
    );
  }
}
