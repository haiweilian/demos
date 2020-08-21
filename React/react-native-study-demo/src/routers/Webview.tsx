import React from 'react';
import {Alert} from 'react-native';
import WebView from 'react-native-webview';

// 自己选个还有空场的电影页面
const uri = 'https://m.mtime.cn/#!/onlineticket/592463544/';

const INJECT_JS = (window, document) => {
  // let submitBtn;
  // function waitForBtnRender() {
  //   submitBtn = document.getElementById('submitBtn');
  //   if (!submitBtn) {
  //     // 提交按钮渲染了吗？没有的话我过两秒再来问
  //     setTimeout(waitForBtnRender, 2000);
  //   } else {
  //     submitBtn.onclick = () => {
  //       const seats = [];
  //       document.querySelectorAll('.seat_selected').forEach((node) => {
  //         seats.push(node.getAttribute('name'));
  //       });
  //       window.ReactNativeWebView.postMessage(seats.join(', '));
  //     };
  //   }
  // }
  // waitForBtnRender();

  // 里面有 jquery 直接使用事件委托绑定事件了
  $(document).on('click', '#submitBtn', function () {
    const seats = [];
    $('.seat_selected').each(function () {
      seats.push($(this).attr('name'));
    });
    window.ReactNativeWebView.postMessage(seats.join(', '));
  });
};

export default function App() {
  return (
    <WebView
      source={{uri}}
      injectedJavaScript={`(${INJECT_JS.toString()})(window, document)`}
      onMessage={(e) => {
        Alert.alert('您选中的座位是：' + e.nativeEvent.data);
      }}
    />
  );
}
