import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Picker } from '@react-native-picker/picker';
import useBLE from '../useBLE';
import DailyGraphComponent from '../components/DailyGraphComponent'
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
    switch (selectedGraph) {
      case "daily":
        return <DailyGraphComponent data={glucoseData} />;
      case "weekly":
        return <DailyGraphComponent data={glucoseData} />;
      case "monthly":
        return <DailyGraphComponent data={glucoseData} />;
      default:
        return <Text>Select a valid time period.</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Old Data</Text>
      <Text>Select a time period:</Text>

      {/* Dropdown Picker */}
      <Picker
        selectedValue={selectedGraph}
        onValueChange={(itemValue) => setSelectedGraph(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
        <Picker.Item label="Monthly" value="monthly" />
      </Picker>

      {/* Debugger output to see if entries loaded from json file */}
      <View>
        <Text>Data loaded: {glucoseData.length} entries</Text>
      </View>

      {/* Render Selected Graph */}
      <View style={styles.graphContainer}>{renderGraph()}</View>
    </View>
  );
};

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
