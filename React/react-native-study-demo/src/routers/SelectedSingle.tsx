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
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  return (
    <View style={styles.container}>
      <Text>单选</Text>
      <View style={styles.innerContainer}>
        {[...new Array(9)].map((_, i) => {
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedIndex(i)}
              style={[
                styles.cell,
                selectedIndex === i && {backgroundColor: 'green'},
              ]}
            />
          );
        })}
      </View>
    </View>
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
