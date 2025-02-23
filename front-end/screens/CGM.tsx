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
  const {
    requestPermissions,
    scanForPeripherals,
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
    clearDatabase,
    batteryStatus
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // const [glucoseData, setGlucoseData] = useState<number[]>([]);

  useEffect(() => {
    const loadGlucoseData = async () => {
      const data = await readDataFromDB();
      if (Array.isArray(data)) {
        const updatedData = data.slice(-40)
        // setGlucoseData(updatedData)
        console.log("Loaded glucose history:", data);
      }
      else {
        console.log("Invalid data read")
      }
    };

    loadGlucoseData();
  }, []);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  const handleTransmitData = (event: any) => {
    // Call the async function but don't return a promise
    if (connectedDevice) {
      transmitData(connectedDevice, 'disconnect').catch((error) => console.log("Error transmitting data:", error));
    } else {
      console.log("No device connected");
    }
  };

  const handleStartReading = (event: GestureResponderEvent) => {
    if (connectedDevice) {
      transmitData(connectedDevice, 'start').catch((error) => console.log("Error transmitting data:", error));
    } else {
      console.log("No device connected");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.batteryDisplay}>
        <Text style={styles.batteryText}>Battery Level: </Text>
      </View>
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

      <View style={styles.graphContainer}>
        <GraphComponent data={glucoseHistory} />
      </View>

      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaButtonText}>
          {connectedDevice ? "Disconnect" : "Connect"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleStartReading} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Start Reading</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={clearDatabase} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Clear database contents</Text>
      </TouchableOpacity>

      <Button title="Transmit Data" onPress={handleTransmitData} />  

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