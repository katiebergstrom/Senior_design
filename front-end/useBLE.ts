import { useMemo, useState, useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { Alert } from 'react-native';
import RNFS from "react-native-fs"
import * as SQLite from "expo-sqlite/legacy";
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
  initDB: () => void;
  saveDataToDB: (data: any) => void;
  readDataFromDB: () => void;
  appendDataToFile: (data: any) => void;
  readDataFromFile: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  glucoseRate: number;
  glucoseHistory: { x: string; y: number }[];
  batteryStatus: String;
  clearFileContents: () => void;
  clearDatabase: () => void;
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

  const db = SQLite.openDatabase("glucose_data.db");

  const initDB = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS glucose_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          time TEXT,
          glucoseLevel INTEGER,
          batteryLevel TEXT
        );`,
        [],
        () => console.log("Database initialized"),
        (_, error) => {
          console.log("Database initialization error:", error);
          return true;
        }
      );
    });
  };

  useEffect(() => {
    console.log("Initializing database...");
    initDB();
  }, []);

  const saveDataToDB = (data: { time: string; glucoseLevel: number; batteryLevel: string }) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO glucose_data (time, glucoseLevel, batteryLevel) VALUES (?, ?, ?);",
        [data.time, data.glucoseLevel, data.batteryLevel],
        () => console.log("Data saved to SQLite:", data),
        (_, error) => {
          console.log("Error saving data:", error);
          return true;
        }
      );
    });
  };

  const readDataFromDB = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM glucose_data;",
        [],
        (_, result) => {
          const data = result.rows._array;
          console.log("Data read from SQLite:", data);
          setGlucoseHistory(data.map((entry) => ({ x: entry.time, y: entry.glucoseLevel })));
        },
        (_, error) => {
          console.log("Error reading data:", error);
          return true;
        }
      );
    });
  };

  const clearDatabase = () => {
    db.transaction((tx) => {
      tx.executeSql("DELETE FROM glucose_data;", [], 
      () => console.log("Database cleared"), 
      (_, error) => {
        console.log("Error clearing database:", error);
        return true;
      });
    });
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
  

  const onglucoseRateUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      // Log the BLE error message and provide a generic alert
      console.log('BLE Error:', error.message);
      Alert.alert('Disconnected', `${error.message}`);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was recieved");
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
    saveDataToDB({ time, glucoseLevel, batteryLevel });

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
        onglucoseRateUpdate
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
    initDB,
    saveDataToDB,
    readDataFromDB,
    glucoseRate,
    glucoseHistory,
    transmitData,
    clearFileContents,
    clearDatabase,
    batteryStatus,
  };
}

export default useBLE;