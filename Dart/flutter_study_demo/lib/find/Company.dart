import 'package:flutter/foundation.dart';

class Company {

  final String logo;
  final String name;
  final String location;
  final String type;
  final String size;
  final String employee;
  final String hot;
  final String count;
  final String inc;

  //构造器
  Company({
    @required this.logo,
    @required this.name,
    @required this.location,
    @required this.type,
    @required this.size,
    @required this.employee,
    @required this.hot,
    @required this.count,
    @required this.inc
  });

  static List<Company> fromMapData(Map data) {
    List<Company> listMode = List<Company>();
    List list = data['list'];
    list.forEach((v) {
      var model = Company.fromMap(v);
      listMode.add(model);
    });
    return listMode;
  }

  static Company fromMap(Map map) {
    return Company(
      logo: map['logo_url'],
      name: map['name'],
      location: map['download_times_fixed'],
      type: map['type'],
      size: map['tag'],
      employee: map['market_id'],
      hot: map['download_times_fixed'],
      count: map['cid2'],
      inc: map['baike_name']
    );
  }
}
