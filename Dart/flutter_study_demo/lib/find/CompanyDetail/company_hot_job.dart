import 'package:flutter/material.dart';

class CompanyHotJob extends StatelessWidget {
  const CompanyHotJob({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Center(
        child: Text(
          'CompanyHotJob',
          style: TextStyle(
            fontSize: 30,
            color: Colors.red
          ),
        ),
      )
    );
  }
}
