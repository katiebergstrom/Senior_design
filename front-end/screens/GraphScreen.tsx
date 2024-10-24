import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine } from 'victory-native';
import Dropdown from 'react-native-element-dropdown';

const ChartScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <VictoryChart width={Dimensions.get('window').width}>
        <VictoryLine
          data={[
            { x: 'Jan', y: 20 },
            { x: 'Feb', y: 45 },
            { x: 'Mar', y: 28 },
            { x: 'Apr', y: 80 },
            { x: 'May', y: 99 },
            { x: 'Jun', y: 43 },
          ]}
        />
      </VictoryChart>
    </View>
  );
};
//try adding

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChartScreen;
