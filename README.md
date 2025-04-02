# Senior_design

## Flow of the application
When the user enters the application they will be brought to the main screen (CGM screen) where they will be able to connect to a device. On this screen they will be able to see a graph of the latest two minutes of their glucose levels as well as the current level and battery status displayed on top of the screen. 

### CGM Screen
* Imports the necessary functions that will be needed from useBLE hook, all functions that do majority of work are written in useBLE
* As soon as the screen is loaded any glucose data that is stored in the database will be read and displayed on the screen (if there is anything stored)
* handleStartReading function is connected to the "Start Reading" button displayed on screen which will send the epoch time and code to the board to begin reading glucose data
* handleExportFile function is connected to the "Export file to SD card" button displayed on the screen which will copy the current file over to the SD card

### useBLE variables and functions
* At the beginning of the file we define the useBLE interface functions and what they will all return as well as any variables
* glucoseRate variable is used to store the most recent read glucose level from the board
* glucoseHistory is a list used to store the 40 most recent read glucose levels from the board (This is used for the graph). This list is set up as a pairs of a string representing time and a number representing the glucose level
* requestStoragePermissions function purpose is to request the storage permissions on the android device so we are able to write to the SD card
* getSdCardPath function will get the path of the SD card on the device so that we are able to use that path to write to the SD card
* DATABASE FUNCTIONS
* BLUETOOTH FUNCTIONS
* onglucoseRateUpdate function is where a bulk of the work happens. Whenever a new value is read from the connected device onglucoseRateUpdate function will first handle any errors when reading, and if none are received it will decode the data sent over. Once the data is split up it will be stored in its respective variables and then saved to the database. glucoseRate and batteryStatus variables are set. The latest (x,y) point is added to glucoseHistory list
* startStreamingData
* transmitData function is responsible for sending over the correct codes to the board. The function has two possible actions as a parameter that we use to send the correct code over to the board based on whether we want to start streaming data or disconnect from the board. 
* exportFileToSDCard function will copy the exisiting file over to the defined SD card path

### So how do different parts flow through the files?
SD Card
* Once user hits 'Export file to SD card' button it will invoke handleExportFile function in CGM.tsx. This function then invokes exportFileToSDCard function from useBLE which copies the file over to the defined SD card path

Start Streaming Data
* Once user hits 'Start streaming' button it will invoke handleStartReading function in CGM.tsx. This function will call transmitData function from useBLE.tsx with 'start' as the second parameter. Once this hits transmitData in useBLE the code for 'start' will be sent to the connected device, and data will start streaming to the main screen.

Connecting or Disconnecting from the device
* If no device is currently connected, the user will see a 'Connect' button.
* If a device is connected, the user will see a 'Disconnect' button. Once they click this button


## Graph History Screens
The graph history page is stored in screens/OldGraphsScreen.tsx. The OldGraphsScreen consists of a dropdown menu where the user can select to see their history from the previous 6 hours, previous 12 hours, or previous 24 hours. Depeding on the selection, the corresponding graph will be pulled up. These graphs are all in the components folder and labeled according to the time they are displaying. 

### OldGraphsScreen
* The first thing this screen does is import the json file which has glucose readings every five minutes from the past 7 days. We import the file from '/assets/data/glucose_data_new.json' and call function copyJsonToFileSystem
* copyJsonToFileSystem function is responsible for copying the imported json file over to a local location stored in the app. This way we are able to read the data from the app in order to display it in the graphs. Basically had to copy the file over to get this part to work with React Native
* Then in the screen setup we have two variables. selectedGraph keeps track of which graph is selected by the dropdown. glucoseData is the data read from the file we just copied over to the app
* 
