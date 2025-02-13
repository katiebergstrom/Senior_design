import React, { useState, useEffect } from "react";
import { StyleSheet, SafeAreaView, Text } from "react-native";
import { VictoryChart, VictoryLine, VictoryAxis, VictoryGroup } from "victory-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";

const UpdatedGraphScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, "Graph">>();
  const { heartRateHistory } = route.params; // Access heart rate history from navigation
  const [glucoseData, setGlucoseData] = useState(
    heartRateHistory.map((value, index) => ({
      x: index * 3, // Assuming 3-minute intervals
      y: value,
    }))
  );

  // Update the graph when new data is added to heartRateHistory
  useEffect(() => {
    if (heartRateHistory.length > 0) {
      setGlucoseData(
        heartRateHistory.map((value, index) => ({
          x: index * 3,
          y: value,
        }))
      );
    }
  }, [heartRateHistory]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Glucose Rate Over Time</Text>
      <VictoryChart domain={{ y: [0, 200] }}> {/* Set the y-axis range */}
        {/* Background Color Bands */}
        <VictoryGroup>
          <VictoryLine
            y={() => 100}
            style={{ data: { stroke: "lightgreen", strokeWidth: 5 } }}
          />
          <VictoryLine
            y={() => 150}
            style={{ data: { stroke: "lightyellow", strokeWidth: 5 } }}
          />
          <VictoryLine
            y={() => 200}
            style={{ data: { stroke: "lightcoral", strokeWidth: 5 } }}
          />
        </VictoryGroup>

        {/* Line Chart */}
        <VictoryLine
          style={{ data: { stroke: "#c43a31" } }} // Color for the actual data line
          data={glucoseData}
        />

        {/* Y-Axis */}
        <VictoryAxis
          dependentAxis
          label="Glucose Rate (mg/dL)"
          style={{
            axisLabel: { padding: 35 },
            ticks: { stroke: "grey", size: 5 },
            tickLabels: { fontSize: 10 },
          }}
        />

        {/* X-Axis */}
        <VictoryAxis
          label="Time (minutes)"
          style={{
            axisLabel: { padding: 25 },
          }}
        />
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

export default UpdatedGraphScreen;
