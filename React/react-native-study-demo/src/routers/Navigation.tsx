import React, {useState} from 'react';
import {View, Text, Button, TextInput, StyleSheet} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

function HomeScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('御坂20001号');
  return (
    <View style={styles.container}>
      <Text>{username}</Text>
      <Button
        title="修改用户名"
        onPress={() =>
          navigation.navigate('User', {
            setUsername,
          })
        }
      />
    </View>
  );
}

function UserScreen({route, navigation}: any) {
  const params = route.params;
  const [value, onChangeText] = useState('');
  const changeCallback = function () {
    params.setUsername(value);
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={(text) => onChangeText(text)}
        value={value}
      />
      <Button title="提交" onPress={changeCallback} />
    </View>
  );
}

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="User" component={UserScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
  },
});

export default App;
