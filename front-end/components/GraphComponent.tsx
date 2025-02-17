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

const TIME_WINDOW = 120; // Show 2 minutes worth of data (120 seconds), hardcoded for now

const GlucoseGraph: React.FC<GlucoseGraphProps> = ({ data }) => {
  const processedData = data.slice(-40).map(entry => ({
    x : convertTimeToSec(entry.x),
    y : entry.y
  })
  ).filter(entry => !isNaN(entry.x));

  if (processedData.length === 0) return null;

  const firstDataPoint = processedData[0].x;
  const latestTime = processedData[processedData.length - 1].x;
  const earliestTime = Math.max(firstDataPoint, latestTime - TIME_WINDOW);

  return (
    <VictoryChart 
      domain={{ x: [earliestTime, earliestTime + TIME_WINDOW], y: [990, 1200] }} // X-axis starts from 0 to 120 (2 minutes)
      domainPadding={10}
    >
      <VictoryGroup>
        <VictoryLine y={() => 1000} style={{ data: { stroke: "lightgreen", strokeWidth: 5 } }} />
        <VictoryLine y={() => 1100} style={{ data: { stroke: "lightyellow", strokeWidth: 5 } }} />
        <VictoryLine y={() => 1200} style={{ data: { stroke: "lightcoral", strokeWidth: 5 } }} />
      </VictoryGroup>
      <VictoryLine
          style={{ data: { stroke: "#c43a31" } }} // Color for the line
          data={processedData}
        />

        <VictoryScatter
          style={{ data: { fill: "#c43a31" } }} // Color for the points
          size={4} // Size of each point
          data={processedData}
        />

        <VictoryAxis
          dependentAxis
          label="Glucose Rate (mg/dL)"
          style={{ 
            axisLabel: { padding: 38 },  
            tickLabels: { padding: 0 },  
          }}
        />
        <VictoryAxis
        label="Time (HH:MM)"
        style={{ 
          axisLabel: { padding: 25 },  
          tickLabels: { padding: 5 },  
        }}
        tickFormat={(tick) => {
          const minutes = Math.floor((tick % 3600) / 60);
          const seconds = tick % 60;
      
          // Only show labels if seconds == 0 
          if (seconds === 0) {
            const hours = Math.floor(tick / 3600);
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
          } else {
            return ''; 
          }
        }}
      />
    </VictoryChart>
  );
};

export default GlucoseGraph;