import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { Alert } from 'react-native'; // Import Alert for showing warnings
import RNFS from "react-native-fs"
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

import base64 from "react-native-base64";

const GLUCO_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const GLUCO_TX_CHARACTERISTIC = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const GLUCO_RX_CHARACTERISTIC = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const FILE_PATH = RNFS.DocumentDirectoryPath + "/glucose_data.json";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  transmitData: (device: Device, action: 'start' | 'disconnect') => Promise<void>;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  appendDataToFile: (data: any) => void;
  readDataFromFile: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  glucoseRate: number;
  glucoseHistory: { x: string; y: number }[];
  batteryStatus: String;
  clearFileContents: () => void;
}

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [glucoseRate, setglucoseRate] = useState<number>(0);
  const [glucoseHistory, setGlucoseHistory] = useState<{ x: string; y: number }[]>([]);
  const [batteryStatus, setBatteryStatus] = useState<string>("");

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device.name?.includes("Gluco")) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);

    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setglucoseRate(0);
    }
  };

  const appendDataToFile = async (data: any) => {
    try {
      const fileExists = await RNFS.exists(FILE_PATH);
      let fileContents = "[]";

      if (fileExists) {
        fileContents = await RNFS.readFile(FILE_PATH, "utf8");
      }

      const jsonData = JSON.parse(fileContents);
      jsonData.push(data);

      await RNFS.writeFile(FILE_PATH, JSON.stringify(jsonData, null, 2), "utf8");

      console.log("Data appended to file:", data);
    }
    catch (error) {
      console.log("Error writing to file:", error)
    }
  }

  const readDataFromFile = async () => {
    try {
      const fileExists = await RNFS.exists(FILE_PATH);
      if (!fileExists) {
        console.log("File does not exist. Returning empty array.");
        setGlucoseHistory([]); 
        return;
      }
  
      const fileContents = await RNFS.readFile(FILE_PATH, "utf8");
      const parsedData = JSON.parse(fileContents);
  
      const formattedData = parsedData.map((entry: any) => ({
        x: entry.time,
        y: entry.glucoseLevel,
      }));
  
      setGlucoseHistory(formattedData);
    } catch (error) {
      console.log("Error reading file:", error);
      setGlucoseHistory([]); 
    }
  };
  

  const onGlucoseRateUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    // If there is a BLE error, handle it
    if (error) {
        // Log the BLE error message and provide a generic alert
        console.log('BLE Error:', error.message);
        Alert.alert('Disconnected', `${error.message}`);
      return -1;
    }
  
    // Ensure characteristic is present and has value
    if (!characteristic?.value) {
      console.log('No data received');
      return -1;
    }
    try {
    const rawData = base64.decode(characteristic.value);
    //console.log("rawData= ", rawData);

    //setglucoseRate(+rawData);
    console.log("rawData= ", rawData);

    const parts = rawData.split(',');
    if (parts.length < 3) {
      console.log("Invalid data format");
      return;
    }
    
    const time = parts[0];
    const glucoseLevel = +parts[1];
    const batteryLevel = parts[2];

    const newData = { time, glucoseLevel, batteryLevel }
    appendDataToFile(newData);

    setglucoseRate(glucoseLevel);
    setBatteryStatus(batteryLevel);

    setGlucoseHistory((prev) => {
      const newDataPoint = { x: time, y: glucoseLevel };

      const updatedHistory = [...prev, newDataPoint].slice(-40);

      return updatedHistory;
    });
  } catch (e) {
    console.log("Error decoding data:", e);
  }
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        GLUCO_UUID,
        GLUCO_RX_CHARACTERISTIC,
        onGlucoseRateUpdate
      );
    } else {
      console.log("No Device Connected");
    }
  };


  const transmitData = async (device: Device, action: 'start' | 'disconnect') => {
    if (device && connectedDevice) {
      try {
        let code: string;
        // Writing data to the characteristic
        if (action === 'start') {
          code = "2025/02/02/04/30/00"
        }
        else if (action === 'disconnect') {
          code = "1116";
        }
        else {
          console.log("Invalid action");
          return;
        }
        const bytes = base64.encode(code);
        await device.writeCharacteristicWithoutResponseForService(
          GLUCO_UUID,
          GLUCO_TX_CHARACTERISTIC,
          bytes
        );

        console.log(`Data transmitted: ${bytes}`);
      } catch (error) {
        console.log("Error transmitting data:", error);
      }
    } else {
      console.log("No device connected or device is not ready.");
    }
  };
  
  const clearFileContents = async () => {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/glucose_data.json`;
      await RNFS.writeFile(filePath, JSON.stringify([]), 'utf8'); // Overwrite with empty array
      setGlucoseHistory([]);
      console.log("File contents cleared");
    } catch (error) {
      console.error("Error clearing file contents:", error);
    }
  };  

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    appendDataToFile,
    readDataFromFile, 
    glucoseRate,
    glucoseHistory,
    transmitData,
    clearFileContents,
    batteryStatus,
  };
}

export default useBLE;
