import React from 'react';
import {Text, StyleSheet, View} from 'react-native';

function App() {
  return (
    <View style={styles.container}>
      <Text>把 src/routers 下的示例复制到 App.tsx 文件里查看效果</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
