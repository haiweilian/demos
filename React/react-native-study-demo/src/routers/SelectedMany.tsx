import React from 'react';
import {
  TouchableOpacity,
  Dimensions,
  View,
  StyleSheet,
  Text,
} from 'react-native';

const {width} = Dimensions.get('window');
const cellWidth = width * 0.3;
export default function App() {
  return (
    <View style={styles.container}>
      <Text>多选</Text>
      <View style={styles.innerContainer}>
        {[...new Array(9)].map((_, i) => {
          return <Cell key={i} />;
        })}
      </View>
    </View>
  );
}

function Cell() {
  const [selected, setSelected] = React.useState(false);
  return (
    <TouchableOpacity
      onPress={() => setSelected(!selected)}
      style={[styles.cell, selected && {backgroundColor: 'green'}]}
    />
  );
}

const styles = StyleSheet.create({
  container: {},
  innerContainer: {
    marginTop: 100,
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: cellWidth,
    height: cellWidth,
    borderWidth: 1,
    borderColor: 'black',
  },
});
