import React, { useState, useEffect } from "react";
import RNFS from "react-native-fs"
import {
  Button,
  GestureResponderEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Device } from "react-native-ble-plx";
import DeviceModal from "../DeviceConnectionModal";
import { GlucoseArrow } from "../PulseIndicator";
import useBLE from "../useBLE";
import GraphComponent from "../components/GraphComponent"

const App = () => {
  // Import all necessary functions from useBLE
  const {
    requestPermissions,
    scanForPeripherals,
    requestStoragePermissions,
    getSdCardPath,
    allDevices,
    connectToDevice,
    connectedDevice,
    glucoseRate,
    glucoseHistory,
    disconnectFromDevice,
    saveDataToDB,
    readDataFromDB,
    appendDataToFile,
    readDataFromFile, 
    transmitData,
    clearFileContents,
    exportFileToSDCard,
    clearDatabase,
    batteryStatus
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const loadGlucoseData = async () => {
      //Load the data from the database
      const data = await readDataFromDB();
      if (Array.isArray(data)) {
        console.log("Loaded glucose history:", data);
      }
      else {
        console.log("Invalid data read")
      }
    };

    loadGlucoseData();
  }, []);

  // Requests necessary BLE permissions by calling requestPermissions().
  // If permissions are granted, it starts scanning for nearby BLE devices using scanForPeripherals().
  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };
  
 // Calls scanForDevices() to start scanning for BLE devices.
  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  //This function is unused now but it originally transmitted disconnect code to board
  const handleTransmitData = (event: any) => {
    if (connectedDevice) {
      transmitData(connectedDevice, 'disconnect').catch((error) => console.log("Error transmitting data:", error));
    } else {
      console.log("No device connected");
    }
  };

  //Connected to button below to transmit data to board to read glucose levels
  const handleStartReading = (event: GestureResponderEvent) => {
    if (connectedDevice) {
      transmitData(connectedDevice, 'start').catch((error) => console.log("Error transmitting data:", error));
    } else {
      console.log("No device connected");
    }
  };

  //This function will export the file to SD card for the button on screen
  const handleExportFile = async () => {
    try {
      await exportFileToSDCard();
      console.log("File successfully exported to SD card");
    } catch (error) {
      console.error("Error exporting file to SD card:", error);
    }
  };  

  return (
    <SafeAreaView style={styles.container}>
      {/* Simple view to display battery level in top right */}
      <View style={styles.batteryDisplay}>
        <Text style={styles.batteryText}>Battery Level: {batteryStatus}</Text>
      </View>

      {/* Displays glucose level and arrow if device is connected, if not displays text to connect */}
      <View style={styles.glucoseRateTitleWrapper}>
        {connectedDevice ? (
          <>
          <GlucoseArrow glucoseHistory= {glucoseHistory}/>
          <Text style={styles.glucoseRateTitleText}>Your Glucose Rate Is:</Text>
          <Text style={styles.glucoseRateText}>{glucoseRate} mg/dL</Text>
        </>
        ) : (
          <Text style={styles.glucoseRateTitleText}>
            Please Connect to a Glucose Monitor
          </Text>
        )}
      </View>

      {/* Pull up the graph component with glucoseHistory as data */}
      <View style={styles.graphContainer}>
        <GraphComponent data={glucoseHistory} />
      </View>

        {/* Button to connect or disconnect based on device connection */}
      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaButtonText}>
          {connectedDevice ? "Disconnect" : "Connect"}
        </Text>
      </TouchableOpacity>

        {/* Buttons that appear on main screen */}
      <TouchableOpacity onPress={handleStartReading} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Start Reading</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={clearDatabase} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Clear database contents</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleExportFile} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Export File to SD Card</Text>
      </TouchableOpacity>

      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  glucoseRateTitleWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  glucoseRateTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
    color: "black",
  },
  glucoseRateText: {
    fontSize: 25,
    marginTop: 15,
    marginBottom: 30
  },
  graphContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingBottom: 90
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  batteryDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", 
    padding: 10,
    marginRight: 20,
  },
  batteryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },  
});

export default App;
