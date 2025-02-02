import React from 'react';
import { StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryAxis, VictoryGroup } from 'victory-native';

interface GlucoseGraphProps {
  data: { x: string; y: number }[];
}

const GlucoseGraph: React.FC<GlucoseGraphProps> = ({ data }) => {
  return (
    <VictoryChart domain={{ x: [0, 120], y: [990, 1200] }}>
      <VictoryGroup>
        <VictoryLine y={() => 1000} style={{ data: { stroke: "lightgreen", strokeWidth: 5 } }} />
        <VictoryLine y={() => 1100} style={{ data: { stroke: "lightyellow", strokeWidth: 5 } }} />
        <VictoryLine y={() => 1200} style={{ data: { stroke: "lightcoral", strokeWidth: 5 } }} />
      </VictoryGroup>
      {/* Line for continuous data */}
      <VictoryLine
          style={{ data: { stroke: "#c43a31" } }} // Color for the line
          data={data}
        />

        {/* Points for each data value */}
        <VictoryScatter
          style={{ data: { fill: "#c43a31" } }} // Color for the points
          size={4} // Size of each point
          data={data}
        />

        {/* Axes */}
        <VictoryAxis
          dependentAxis
          label="Glucose Rate (mg/dL)"
          style={{ axisLabel: { padding: 35 } }}
        />
        <VictoryAxis
        label="Time (minutes)"
        style={{ axisLabel: { padding: 25 } }}
        tickFormat={(tick) => `${tick} min`}
      />
    </VictoryChart>
  );
};

export default GlucoseGraph;
