// screens/BluetoothScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

const BluetoothScreen: React.FC = () => {
  const [bleManager] = useState(new BleManager());
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  // Request Bluetooth and location permissions (required for Android)
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      if (
        granted['android.permission.BLUETOOTH_SCAN'] !== PermissionsAndroid.RESULTS.GRANTED ||
        granted['android.permission.BLUETOOTH_CONNECT'] !== PermissionsAndroid.RESULTS.GRANTED ||
        granted['android.permission.ACCESS_FINE_LOCATION'] !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Permissions denied');
        return false;
      }
    }
    return true;
  };

  // Start scanning for devices
  const scanDevices = async () => {
    const permissionsGranted = await requestPermissions();
    if (!permissionsGranted) return;

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Error while scanning:', error);
        return;
      }
      if (device && !devices.find((d) => d.id === device.id)) {
        setDevices((prevDevices) => [...prevDevices, device]);
      }
    });
  };

  // Stop scanning
  useEffect(() => {
    return () => {
      bleManager.stopDeviceScan();
    };
  }, [bleManager]);

  // Function to connect to a device
  const connectToDevice = async (device: Device) => {
    bleManager.stopDeviceScan();
    try {
      const connected = await device.connect();
      setConnectedDevice(connected);
      console.log('Connected to', device.name);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Bluetooth Devices</Text>

      {connectedDevice ? (
        <Text style={styles.connectedText}>
          Connected to: {connectedDevice.name || connectedDevice.id}
        </Text>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.deviceButton}
              onPress={() => connectToDevice(item)}
            >
              <Text style={styles.deviceText}>
                {item.name ? item.name : item.id}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {!connectedDevice && (
        <Button title="Scan for Devices" onPress={scanDevices} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  deviceButton: {
    padding: 16,
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deviceText: {
    fontSize: 18,
  },
  connectedText: {
    fontSize: 18,
    color: 'green',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default BluetoothScreen;
