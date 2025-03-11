import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryAxis, VictoryGroup, VictoryBar, VictoryLabel, VictoryStack } from 'victory-native';
import LinearGradient from 'react-native-linear-gradient';

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

const TIME_WINDOW = 86400; // Show 1 day worth of data

const GlucoseGraph: React.FC<GlucoseGraphProps> = ({ data }) => {
  // const [glucoseData, setGlucoseData] = useState<{ x: string; y: number }[]>([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await readDataFromFile(FILE_PATH);
  //     setGlucoseData(data);
  //   };

  //   fetchData();
  // }, []);

  //THIS NEEDS TO BE FIXED
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
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 800, height: 500, position: 'relative' }}>

      <LinearGradient
        colors={['#FFFACD', '#FFFACD', '#ADFF2F', '#ADFF2F', '#FFA07A', '#FFA07A']} 
        locations={[0, 0.3, 0.3, 0.7, 0.7, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={[styles.gradientBackground, { height: 400 }]}
      />

      <VictoryChart 
        height={500}
        domain={{ x: [earliestTime, earliestTime + TIME_WINDOW], y: [70, 150] }} 
        domainPadding={10}
      >

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
            const hours = Math.floor(tick / 3600);
            const minutes = Math.floor((tick % 3600) / 60);
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
         }}         
        />
      </VictoryChart>
      </View>
      </View>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    position: 'absolute',
    top: 50,
    left: 50,
    right: 500, 
    width: 700, 
    height: 300, 
    zIndex: -1, // Keeps it behind the graph
  },
});

export default GlucoseGraph;