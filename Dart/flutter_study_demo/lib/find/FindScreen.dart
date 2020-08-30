import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import 'package:flutter_study_demo/find/CompanyItem.dart';
import 'package:flutter_study_demo/find/company.dart';
import 'package:flutter_study_demo/find/companyDetail/CompanyDetailScreen.dart';
import 'package:flutter_study_demo/provider/find_list.dart';

class FindScreen extends StatefulWidget {
  FindScreen({Key key}) : super(key: key);

  @override
  _FindScreenState createState() => _FindScreenState();
}

class _FindScreenState extends State<FindScreen> {

  RefreshController _refreshController = RefreshController(initialRefresh: false);

  @override
  void initState() {
    super.initState();
    FindListProvider provider = Provider.of<FindListProvider>(context, listen: false);
    provider.refreshData();
  }

  _onLoading() async {
    FindListProvider provider = Provider.of<FindListProvider>(context, listen: false);
    bool isSuccess = await provider.loadMoreData();
    if(isSuccess) {
      _refreshController.loadComplete();
    }else {
      _refreshController.loadFailed();
    }
  }

  _onRefresh() async {
    FindListProvider provider = Provider.of<FindListProvider>(context, listen: false);
    bool isSuccess = await provider.refreshData();
    if(isSuccess) {
      _refreshController.refreshCompleted();
    }else {
      _refreshController.refreshFailed();
    }
  }

  _buildContent() {
    return Consumer<FindListProvider>(
      builder: (context, provider, _) {
        return IndexedStack(
          index: provider.showValue,
          children: <Widget>[
            Center(
              child: CircularProgressIndicator()
            ),
            _buildListView()
          ],
        );
      }
    );
  }

  _buildListView() {
    FindListProvider provider = Provider.of<FindListProvider>(context, listen: false);
    return SmartRefresher(
      controller: _refreshController,
      enablePullDown: true,
      enablePullUp: true,
      header: ClassicHeader(
        refreshingText: '正在加载更多...',
        idleText: '下拉刷新',
        completeText: '加载完成',
        releaseText: '松开刷新',
      ),
      footer: ClassicFooter(
        idleText:'加载更多数据',
        loadingText:'玩命加载中...',
        noDataText:'没有更多数据'
      ),
      onLoading: _onLoading,
      onRefresh: _onRefresh,
      child: ListView.builder(
        itemCount: provider.companyList.length,
        itemBuilder: (context, index) {
          Company model = provider.companyList[index];
          return InkWell(
            onTap: (){
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) {
                    return CompanyDetailScreen(model);
                  }
                )
              ).then((value) => {
                print(value)
              });
            },
            child: CompanyItem(model),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('发现'),
      ),
      body: _buildContent()
    );
  }
}
