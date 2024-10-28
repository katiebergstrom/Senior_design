import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceModal from "../DeviceConnectionModal";
import { PulseIndicator } from "../PulseIndicator";
import useBLE from "../useBLE";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";

const App = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    heartRate,
    disconnectFromDevice,
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([]); //list to keep track

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Append the new heart rate to history whenever it updates
  useEffect(() => {
    if (heartRate !== null) {
      setHeartRateHistory((prev) => [...prev, heartRate]);
    }
  }, [heartRate]);

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

  const viewGraph = () => {
    navigation.navigate("Graph", { heartRateHistory });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
        {connectedDevice ? (
          <>
            <PulseIndicator />
            <Text style={styles.heartRateTitleText}>Your Glucose Rate Is:</Text>
            <Text style={styles.heartRateText}>{heartRate} mg/dL</Text>
          </>
        ) : (
          <Text style={styles.heartRateTitleText}>
            Please Connect to a Glucose Monitor
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaButtonText}>
          {connectedDevice ? "Disconnect" : "Connect"}
        </Text>
      </TouchableOpacity>
      {heartRateHistory.length > 0 && (
        <TouchableOpacity onPress={viewGraph} style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>View Glucose History</Text>
        </TouchableOpacity>
      )}
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
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
    color: "black",
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
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