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
* glucoseHistory is a list used to store the 40 most recent read glucose levels from the board (This is used for the graph)
