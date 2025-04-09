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
//All the codes we will need for transmitting to device
const START_GLUCOSE = '1110';
const STOP_GLUCOSE = '1111';
const START_ALIGNMNENT = '1112';
const STOP_ALIGNMENT = '1113';
const ALIGNED = '1114';
const SINGLE_LED = '1115';
const READ_FILE_DATA = '1116';
const DISCONNECT_BLE = '1117';

interface BluetoothLowEnergyApi {
  //Set up all the functions and what they return for useBLE hook
  requestPermissions(): Promise<boolean>;
  requestStoragePermissions(): Promise<boolean>;
  getSdCardPath(): Promise<string | null>;
  scanForPeripherals(): void;
  transmitData: (device: Device, action: 'start' | 'read' | 'disconnect') => Promise<void>;
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
  longGlucoseHistory: { x: string; y: number }[];
  batteryStatus: String;
  exportFileToSDCard(): Promise<void>;
  clearFileContents: () => void;
  clearDatabase: () => void;
}

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [glucoseRate, setglucoseRate] = useState<number>(0);
  const [glucoseHistory, setGlucoseHistory] = useState<{ x: string; y: number }[]>([]);
  const [longGlucoseHistory, setLongGlucoseHistory] = useState<{ x: string; y: number }[]>([]);
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

  //We need this function to be able to write to an SD card on the device
  const requestStoragePermissions = async () => {
    try {
      // Check if both read and write permissions are granted
      const readGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      const writeGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      
      // If permissions are not granted, request them
      if (!readGranted || !writeGranted) {
        console.log('Read and/or write permissions have not been granted, requesting now...');

        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        ]);

        if (
          granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Read and write permissions granted');
          return true;
        } else {
          console.log('Permissions not granted');
          return false;
        }
      } else {
        console.log('Permissions already granted');
        return true;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  //Function to get the location of the SD card so we can write to it
  //not sure we need this
  const getSdCardPath = async () => {
    try {
        const externalStorageDirs = await RNFS.getAllExternalFilesDirs();
        console.log('External Storage Directories:', externalStorageDirs);
        return externalStorageDirs.length > 1 ? externalStorageDirs[1] : null;
    } catch (error) {
        console.error('Error getting SD card path:', error);
        return null;
    }
  };
// On a device with both internal and removable SD storage, it might return:
// javascript
// Copy
// Edit
// [
//   "/storage/emulated/0/Android/data/com.yourapp/files",
//   "/storage/1234-5678/Android/data/com.yourapp/files"
// ]
// First path: Primary external storage (/storage/emulated/0/), which is the built-in storage.
// Second path: External SD card (/storage/1234-5678/), if available.

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

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS event_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT,
          event TEXT
        );`,
        [],
        () => console.log("Event log table initialized"),
        (_, error) => {
          console.log("Error initializing event log table:", error);
          return true;
        }
      );
    });
  };

  const logEvent = (event: string) => {
    const timestamp = new Date().toISOString();
    db.transaction(tx => {
      tx.executeSql(
        "INSERT INTO event_log (timestamp, event) VALUES (?, ?);",
        [timestamp, event],
        () => console.log("Event logged:", event),
        (_, error) => {
          console.log("Error logging event:", error);
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
          setLongGlucoseHistory(data.map((entry) => ({ x: entry.time, y: entry.glucoseLevel })));
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
    setGlucoseHistory([]);
    setLongGlucoseHistory([]);
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
      logEvent(`Connected to device: ${device.name}`);

    } catch (e) {
      console.log("FAILED TO CONNECT", e);
      logEvent(`Failed to connect to device: ${device.name}`);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setglucoseRate(0);
      logEvent("Device disconnected");
    }
  };

  //Original function I created to append data to file - will remove eventually and use DB instead only
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

  //Same readDataFromFile function - will eventually remove, I have it stored somewhere else
  const readDataFromFile = async () => {
    try {
      const fileExists = await RNFS.exists(FILE_PATH);
      if (!fileExists) {
        console.log("File does not exist. Returning empty array.");
        setGlucoseHistory([]); 
        setLongGlucoseHistory([]); 
        return;
      }
  
      const fileContents = await RNFS.readFile(FILE_PATH, "utf8");
      const parsedData = JSON.parse(fileContents);
  
      const formattedData = parsedData.map((entry: any) => ({
        x: entry.time,
        y: entry.glucoseLevel,
      }));
  
      setGlucoseHistory(formattedData);
      setLongGlucoseHistory(formattedData);
    } catch (error) {
      console.log("Error reading file:", error);
      setGlucoseHistory([]); 
      setLongGlucoseHistory([]); 
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
    
    console.log("rawData= ", rawData);

    //Split up data received back from the board
    const parts = rawData.split('/');
    if (parts.length < 3) {
      console.log("Invalid data format");
      return;
    }
    
    //Put split data into appropriate variables
    const time = parts[0];
    const glucoseLevel = +parts[1];
    const batteryLevel = parts[2];
    //const errorCode = parts[3];

    //Separate new data to append to file and save to database
    const newData = { time, glucoseLevel, batteryLevel }
    appendDataToFile(newData);
    saveDataToDB({ time, glucoseLevel, batteryLevel });

    setglucoseRate(glucoseLevel);
    setBatteryStatus(batteryLevel);

    //Always slice data to last 40 points for main graph display
    setGlucoseHistory((prev) => {
      const newDataPoint = { x: time, y: glucoseLevel };

      const updatedHistory = [...prev, newDataPoint].slice(-40);

      return updatedHistory;
    });

    //Used for graph
    setLongGlucoseHistory((prev) => {
      const newDataPoint = { x: time, y: glucoseLevel };

      const updatedHistory = [...prev, newDataPoint]

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

  //Function to send codes to device
  const transmitData = async (device: Device, action: 'start' | 'read' | 'disconnect') => {
    if (device && connectedDevice) {
      try {
        let code: string;
        let currentDate : number;
        // Writing data to the characteristic
        if (action === 'start') {
          currentDate = Math.floor(Date.now() / 1000) - 18000;
          console.log("Current date: ", currentDate)
          code = "1113" + "/" + currentDate;
          console.log(code);
          //code = STOP_ALIGNMENT + "/" + currentDate;
          //also need to send 1110 here and send timestamp as soon as app starts
          //
        }
        else if (action == 'read') {
          code = '1110';
        }
        else if (action === 'disconnect') {
          code = DISCONNECT_BLE;
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

  const exportFileToSDCard = async () => {
    // const sdCardPath = await getSdCardPath();
    // if (!sdCardPath) {
    //     console.error("SD Card path not found");
    //     return;
    // }

    //Had to temporarily change path location for testing
    const sdCardPath = "/storage/4A21-0000/Download/glucose_data.json";
    await RNFS.copyFile(FILE_PATH, sdCardPath);
    console.log("File exported to:", sdCardPath);

    // const destPath = `${sdCardPath}/glucose_data.json`;
    // console.log("Destination path: ", destPath);

    try {
        // This will overwrite the file that is already in the sd card
        await RNFS.copyFile(FILE_PATH, sdCardPath);
        console.log("File exported to SD card successfully!");
    } catch (error) {
        console.error("Error exporting file to SD card:", error);
    }
  };

  //Function to clear file contents for testing purposes
  const clearFileContents = async () => {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/glucose_data.json`;
      await RNFS.writeFile(filePath, JSON.stringify([]), 'utf8'); // Overwrite with empty array
      setGlucoseHistory([]);
      setLongGlucoseHistory([]);
      console.log("File contents cleared");
    } catch (error) {
      console.error("Error clearing file contents:", error);
    }
  };  

  return {
    scanForPeripherals,
    requestPermissions,
    requestStoragePermissions,
    getSdCardPath,
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
    longGlucoseHistory,
    transmitData,
    clearFileContents,
    exportFileToSDCard,
    clearDatabase,
    batteryStatus,
  };
}

export default useBLE;