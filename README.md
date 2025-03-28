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
...

### So how do different parts flow through the files?
SD Card
* Once user hits 'Export file to SD card' button it will invoke handleExportFile function in CGM.tsx. This function then invokes exportFileToSDCard function from useBLE which copies the file over to the defined SD card path

Start Streaming Data
*
