(function() {
    'use strict';

    var CONFIG = require('./node-config.js');
    var http = require('http');
    var ws = require("ws");
    var ProtoBuf = require("protobufjs");

    var CesiumSync = ProtoBuf.loadProtoFile("cesiumsync.proto").build("CesiumSync");

    var server = http.createServer();

    server.listen(CONFIG.NODE_SERVER_PORT, function() {
        console.log("WS Relay Server listening on " + CONFIG.NODE_SERVER_IP + ":" + CONFIG.NODE_SERVER_PORT);
    });


    var wsServer = new ws.Server({
        server: server
    });


    var clientWSCount = 0, activeWSClientCount = 0;
    var wsClients = {};
	var count = 0;

    //Preserving State
    var state_sync = new CesiumSync();
    //var camera_sync = new CesiumSync();
    state_sync.msgtype = 3;
    //camera_sync.msgtype = 1;

    wsServer.on("connection", function(socket) { // Port 8081

        //Keep count of all connected clients
        var id = clientWSCount++;
        activeWSClientCount++;
        //Store connection object for each of the clients
        wsClients[id] = socket;
        console.log((new Date()) + ' Connection accepted [' + id + '], Active clients '+ activeWSClientCount);
        if(activeWSClientCount>1) {
            console.log("Slave Connected. Sending Preserved State to Slave.");

                //msgtype = 0 --> Slave Reload Message
                if(state_sync.msgtype) {//camera_sync.mstype
                //wsClients[id].send(camera_sync.toBuffer());
                wsClients[id].send(state_sync.toBuffer());
                }
        }

        //On receiving message from the Master
        socket.on("message", function(data, flags) {
            if (flags.binary) {
                try {
                    // Decode the Message
                    var sync = CesiumSync.decode(data);
                    //console.log("Received: " + sync.msgtype);
					console.log(" ");
					console.log("sync massage #" + count++);
                    //Broadcast camera properties to connected clients
                    for (var i in wsClients) {
                        if (wsClients[i] != socket)
                            wsClients[i].send(sync.toBuffer());
                    }

                    if(sync.msgtype ==3){
                        if(sync.time!=null) {
                            state_sync.time = sync.time;
                            console.log("Time was updated to: " + sync.time.toString());
                        }
                        if(sync.multiplier!=null) {
                            state_sync.multiplier = sync.multiplier;
                            console.log("Speed was updated to: " + sync.multiplier.toString());
                        }
                        if(sync.play!=null) {
                            state_sync.play = sync.play;
                            console.log("Play was updated to: "+ sync.play.toString());
                        }
                    }

                } catch (err) {
                    console.log("Processing failed:", err);
                }
            } else {
                console.log("Not binary data");
            }
        });
        socket.on("close", function(reasonCode, description) {
            delete wsClients[id];
            activeWSClientCount--;
            console.log((new Date()) + ' Peer ' + id + ' disconnected. Still have '+activeWSClientCount+' clients');
        })
    });

    server.on('error', function(e) {
        if (e.code === 'EADDRINUSE') {
            console.log('Error: Port is already in use, select a different port.');
        } else if (e.code === 'EACCES') {
            console.log('Error: This process does not have permission to listen on port' + CONFIG.NODE_SERVER_PORT);
        }
        console.log(e);
        process.exit(1);
    });

    server.on('close', function() {
        console.log('WS Relay Server stopped.');
    });

    //kill the WebSocket
    var isFirstSig = true;
    process.on('SIGINT', function() {
        if (isFirstSig) {
            console.log('WS Relay Server shutting down.');
            server.close(function() {
                process.exit(0);
            });
            isFirstSig = false;
        } else {
            console.log('WS Relay Server force kill.');
            process.exit(1);
        }
    });


})();
