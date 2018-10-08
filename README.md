# Bachelor-Thesis: Leader-Follower Analysis in Immersive Analysis
* Mentor, University: Dr. Karsten Klein, Universität Konstanz
* Primary Supervisor: Prof. Falk Schreiber, Universität Konstanz
* Secondary Supervisor: Dr. Mate Nagy, Universität Konstanz & Max-Planck-Institut für Ornithologie
* Student: Kim Lasse Rehberg


###  Abstract
This imlpementation creates an immersive enviroment. GPS-Tracks of flocks can be loaded. They will be visualized on a Cesium based Globe. You can run analysis written in Pyhton to determine the times when one individuum is following an other.

### Initial Setup

Copy the whole folder in your running Cesium Folder.


The WS folder may be placed anyware on your PC.

The Sync folder goes in the Cesium root directory. 

The HTML-file 1PythonLF.html goes in Apps/Sandcastle/gallery

If you use a new Cesium file, it has to be initialized with <npm install>.

The 2014-08-07.kml file goes in Apps/SampleData/kml

The FlyingBird folder goes in Apps/SampleData/models


### Start the App

Type node server.js in your console. 

Open *localhost:8080/Apps/Sandcastle/gallery/1PythonLF.html* in your Browser(Chrome or Firefox).




.
.
.

[optional for synchronisation]

Start the WebSocket:
* cd to the WS folder
* <node server.js> starts the WebSocket-Server

Start Cesium:

* Just start it the usaual way: cd to Cesium and *node server.js* starts the server.
  * Master Display: localhost:8080/Apps/Sandcastle/gallery/1PythonLF.html?mode=master
  * Slave Displays: localhost:8080/Apps/Sandcastle/gallery/1PythonLF.html?mode=slave
 
  on your web browser(not Windows Edge).

* If you just start localhost:8080/Apps/Sandcastle/gallery/1PythonLF.html or the mode value is unknown(not one of those [m, master, s, slave]), it will start as a not synchronized version.





