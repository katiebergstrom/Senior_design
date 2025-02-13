import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryGroup } from 'victory-native';

const GraphScreen: React.FC = () => {
  // Initialize state with 40 random data points
  const [glucoseData, setGlucoseData] = useState(generateRandomData());

  // Function to generate random glucose data every 3 minutes for a 2-hour period
  function generateRandomData() {
    const data = [];
    for (let i = 0; i < 40; i++) {
      data.push({
        x: i * 3, // every 3 minutes
        y: Math.floor(Math.random() * (180 - 70 + 1)) + 70, // random glucose rate between 70 and 180
      });
    }
    return data;
  }

  // Add a new data point every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setGlucoseData((prevData) => {
        const nextX = prevData[prevData.length - 1].x + 3;
        const newDataPoint = {
          x: nextX,
          y: Math.floor(Math.random() * (180 - 70 + 1)) + 70,
        };
        // Keep only the latest 40 points
        return [...prevData.slice(1), newDataPoint];
      });
    }, 180000); 

    return () => clearInterval(interval);
  }, []);

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
            tickLabels: { fontSize: 10 }
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

export default GraphScreen;