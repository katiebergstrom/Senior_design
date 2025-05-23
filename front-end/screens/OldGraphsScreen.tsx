import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Picker } from '@react-native-picker/picker';
import useBLE from '../useBLE';
import DailyGraphComponent from '../components/DailyGraphComponent';
import SixHourGraphComponent from '../components/SixHourGraphComponent';
import TwelveHourGraphComponent from '../components/TwelveHourGraphComponent';
import RNFS from "react-native-fs";
import { readDataFromFile } from '../src/functions/readFileData'
import glucoseJson from "../assets/data/glucose_data_new.json";

// Define the props type for this screen using React Navigation's stack parameters
type Props = StackScreenProps<RootStackParamList, 'OldGraphs'>;
//Local file path stored in app
const FILE_PATH = `${RNFS.DocumentDirectoryPath}/new_glucose_data.json`;

//Function to copy json to file system that I needed to import the json file of readings
const copyJsonToFileSystem = async () => {
    const assetPath = "data/new_glucose_data.json"; 
    const fileExists = await RNFS.exists(FILE_PATH);
  
    //If file exists write it to system file
    if (!fileExists) {
      try {
        await RNFS.writeFile(FILE_PATH, JSON.stringify(glucoseJson), "utf8");
        console.log("File copied successfully!");
      } catch (error) {
        console.error("Error copying JSON file:", error);
      }
    }
  };

const OldGraphsScreen: React.FC<Props> = ({ navigation }) => {
  //State to track the selected graph type 
  const [selectedGraph, setSelectedGraph] = useState("daily");

  //State to store the glucose data fetched from the file system
  const [glucoseData, setGlucoseData] = useState<{ x: string; y: number }[]>([]);

  //Fetch glucose data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      await copyJsonToFileSystem();
      const data = await readDataFromFile(FILE_PATH);
      setGlucoseData(data);
    };

    fetchData();
  }, []);

  //Function to render the appropriate graph based on the selected time period
  const renderGraph = () => {
    let dataToDisplay = glucoseData;
    switch (selectedGraph) {
      case "24hour":
        dataToDisplay = glucoseData.slice(-288);
        return <DailyGraphComponent data={dataToDisplay} />;
      case "12hour":
        dataToDisplay = glucoseData.slice(-144);
        return <TwelveHourGraphComponent data={dataToDisplay} />;
      case "6hour":
        dataToDisplay = glucoseData.slice(-72);
        return <SixHourGraphComponent data={dataToDisplay} />;
      default:
        return <Text>Select a valid time period.</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data History</Text>
      <Text>Select a time period:</Text>

      {/* Dropdown Picker */}
      <Picker
        selectedValue={selectedGraph}
        onValueChange={(itemValue) => setSelectedGraph(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Last 24 Hours" value="24hour" />
        <Picker.Item label="Last 12 Hours" value="12hour" />
        <Picker.Item label="Last 6 Hours" value="6hour" />
      </Picker>

      {/* Render Selected Graph */}
      <View style={styles.graphContainer}>{renderGraph()}</View>
    </View>
  );
};

//Add labeling about colors representing which ranges (good, low, high)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  picker: {
    height: 50,
    width: 200,
    marginVertical: 10,
  },
  graphContainer: {
    marginTop: 20,
    width: "100%",
    height: 400, // Adjust height to fit graphs
    justifyContent: "center",
    alignItems: "center",
  },
});

export default OldGraphsScreen;
