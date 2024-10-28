import React from 'react';
import { View, Dimensions, StyleSheet, SafeAreaView, Text } from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis } from 'victory-native';

interface GraphScreenProps {
  route: any;
}

const GraphScreen: React.FC<GraphScreenProps> = ({ route }) => {
  const { heartRateHistory } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Glucose Rate Over Time</Text>
      <VictoryChart
        domain={{ y: [0, 200] }} // Set the y-axis range
      >
        {/* Background Areas */}
        <VictoryArea
          style={{ data: { fill: "lightgreen" } }}
          y={() => 100} // First color section up to 100
        />
        <VictoryArea
          style={{ data: { fill: "lightyellow" } }}
          y={() => 150} // Second color section from 100 to 150
        />
        <VictoryArea
          style={{ data: { fill: "lightcoral" } }}
          y={() => 200} // Third color section from 150 to 200
        />

        {/* Line Chart */}
        <VictoryLine
          style={{ data: { stroke: "#c43a31" } }}
          data={heartRateHistory.map((rate: number, index: number) => ({
            x: index + 1,
            y: rate,
          }))}
        />

        {/* Y-Axis */}
        <VictoryAxis
          dependentAxis
          label="Glucose Rate (mg/dL)"
          style={{
            axisLabel: { padding: 35 },
            ticks: { stroke: "grey", size: 5 },
            tickLabels: { fontSize: 10 }
          }}
        />

        {/* X-Axis */}
        <VictoryAxis label="Time" />
      </VictoryChart>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default GraphScreen;
