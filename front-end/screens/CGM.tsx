import React, { useState } from "react";
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
import { PulseIndicator } from "../PulseIndicator";
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
    transmitData,
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

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
      transmitData(connectedDevice).catch((error) => console.log("Error transmitting data:", error));
    } else {
      console.log("No device connected");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.glucoseRateTitleWrapper}>
        {connectedDevice ? (
          <>
            <PulseIndicator />
            <Text style={styles.glucoseRateTitleText}>Your Glucose Rate Is:</Text>
            <Text style={styles.glucoseRateText}>{glucoseRate} mg/dL</Text>
          </>
        ) : (
          <Text style={styles.glucoseRateTitleText}>
            Please Connect to a Glucose Monitor
          </Text>
        )}
      </View>

        {/* Add the graph below the glucose reading */}
      {connectedDevice && (
        <View style={styles.graphContainer}>
          <GraphComponent data={glucoseHistory} />
        </View>
      )}

      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaButtonText}>
          {connectedDevice ? "Disconnect" : "Connect"}
        </Text>
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
});

export default App;