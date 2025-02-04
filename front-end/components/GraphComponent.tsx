import React from 'react';
import { StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryAxis, VictoryGroup } from 'victory-native';

interface GlucoseGraphProps {
  data: { x: string; y: number }[];
}

//Create a function that converts the given string time to minutes for graph spacing
const convertTimeToSec = (timeStr : string): number => {
  if (!timeStr || !timeStr.includes(':')) return NaN; // Handle missing or invalid time
  const parts = timeStr.split(':').map(Number);
  
  if (parts.length < 3 || parts.some(isNaN)) return NaN;
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const START_TIME_SEC = convertTimeToSec("04:30:00"); // Hardcode graph to start at 4:30 for now
const TIME_WINDOW = 120; // Show 2 minutes worth of data (120 seconds), hardcoded for now

const GlucoseGraph: React.FC<GlucoseGraphProps> = ({ data }) => {
  const processedData = data.slice(-40).map(entry => ({
    x : convertTimeToSec(entry.x) - START_TIME_SEC,
    y : entry.y
  })
  )

  return (
    <VictoryChart 
      domain={{ x: [0, TIME_WINDOW], y: [990, 1200] }} // X-axis starts from 0 to 120 (2 minutes)
      domainPadding={10}
    >
      <VictoryGroup>
        <VictoryLine y={() => 1000} style={{ data: { stroke: "lightgreen", strokeWidth: 5 } }} />
        <VictoryLine y={() => 1100} style={{ data: { stroke: "lightyellow", strokeWidth: 5 } }} />
        <VictoryLine y={() => 1200} style={{ data: { stroke: "lightcoral", strokeWidth: 5 } }} />
      </VictoryGroup>
      {/* Line for continuous data */}
      <VictoryLine
          style={{ data: { stroke: "#c43a31" } }} // Color for the line
          data={processedData}
        />

        {/* Points for each data value */}
        <VictoryScatter
          style={{ data: { fill: "#c43a31" } }} // Color for the points
          size={4} // Size of each point
          data={processedData}
        />

        {/* Axes */}
        <VictoryAxis
          dependentAxis
          label="Glucose Rate (mg/dL)"
          style={{ axisLabel: { padding: 35 } }}
        />
        <VictoryAxis
        label="Time (HH:MM)"
        style={{ axisLabel: { padding: 25 } }}
        tickFormat={(tick) => {
          const actualTime = tick + START_TIME_SEC; // Convert back to absolute time
          if (isNaN(actualTime)) return "00:00";
          const hours = Math.floor(actualTime / 3600);
          const minutes = Math.floor((actualTime % 3600) / 60);
          return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }}
      />
    </VictoryChart>
  );
};

export default GlucoseGraph;