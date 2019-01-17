
var playMaster = true; //keeps track if the play is active
var multMaster = 1; //the multiplier must not be undefined
var toggleTimedSync = true;

const SYNC = 0;
const ASYNC = 1;
const TESTING = 2;

//Switch between Synchronisation modes.
function getSyncStatus(keyCode) {
    switch (keyCode) {
    case 'A'.charCodeAt(0):
        return ASYNC;
    case 'F'.charCodeAt(0):
		return SYNC;
    case 'T'.charCodeAt(0):
		return TESTING;
    default:
        return undefined;
    }
}

document.addEventListener('keydown', function(e) {
    var status = getSyncStatus(e.keyCode);

    if (typeof status !== 'undefined') {
        switch (status) {
        case SYNC:
            toggleTimedSync = true;
            handleSetTime();
            break;
        case ASYNC:
            toggleTimedSync = false;
            break;
        case TESTING:
            console.log("Hello you are testing!!!");
            sendSelctID("TEST ID");
            break;
        default:
            break;
        }
    }
    else {
        console.log("the key pressed has no binding in Sync/master.js");
    }





    if (typeof synced !== 'undefined') {
        toggleTimedSync = synced;
		console.log(toggleTimedSync);
		if (toggleTimedSync){
			handleSetTime();
		}
    }
}, false);


Cesium.BingMapsApi.defaultKey = CONFIG.BingMapsKey;



var bing = new Cesium.BingMapsImageryProvider({
    url : 'http://dev.virtualearth.net',
    key : 'Aj36V6IYWMUkiI1_fOnxPyZxkODEupee3R4MbPCqhYZTDo3deX4UdC7Zc67H8zZf',
    mapStyle : Cesium.BingMapsStyle.AERIAL
});


var viewer = new Cesium.Viewer('cesiumContainer', {
imageryProvider : bing,
    baseLayerPicker : false,
    vrButton : true
});


var clockViewModel = new Cesium.ClockViewModel(viewer.clock);
var animationViewModel = new Cesium.AnimationViewModel(clockViewModel);

var ws = new ReconnectingWebSocket(CONFIG.wsURI, null, {
    binaryType: 'arraybuffer'
});
ws.onopen = function() {

    ws.onmessage = function(evt) {


        try {
            // Decode the Message
            var sync = CesiumSync.decode(evt.data);
            console.log("Message-Type: State Update");
            handleStateChange(sync);

        } catch (err) {
            console.log("Error: " + err);
        }
    };

}





Cesium.knockout.getObservable(viewer.animation.viewModel.clockViewModel, 'shouldAnimate').subscribe(function(value) {
    playMaster = value; //value is true if animation is on play

	if (toggleTimedSync) {
		handleThreeFlags([true,true,true]);//play mult time
	} else {
		handleThreeFlags([true,true,false]);//play mult time
	}
});

Cesium.knockout.getObservable(viewer.animation.viewModel.clockViewModel, 'multiplier').subscribe(function(value) {
    multMaster = value; //value is the multiplier
	if (toggleTimedSync) {
		handleThreeFlags([false,true,true]);//play mult time
	} else {
		handleThreeFlags([false,true,false]);//play mult time
	}
});


function handleSetTime() {
    if (Cesium.defined(viewer.timeline)) {
        console.log("Sending timeline update: "+viewer.clock.currentTime);
        if (ws != undefined) {
            var sync = new CesiumSync();
            sync.msgtype = 3;
            sync.time = viewer.clock.currentTime.toString();
            ws.send(sync.toArrayBuffer());
        }

        //get the same play state es before
        if (playMaster){
            if (multMaster > 0)
                animationViewModel.playForwardViewModel.command();
            else
                animationViewModel.playReverseViewModel.command();
        }

    }
}


//Begin of part for selection
Sandcastle.finishedLoading();
Cesium.knockout.getObservable(viewer, '_selectedEntity').subscribe(function(entity) {
       if (entity !== undefined) {
           //console.log("Entity ID = " + entity.id)
           //console.log("Entity.name = " + entity.name)
           let id = entity.name;  //same idetifier should be choosen in slave.js
           if (id !== undefined) {
                sendSelctID(id);
           }
       }
});

function sendSelctID(selectID){
    console.log("Sending id: " + selectID);

    if (ws != undefined) {
        let sync = new CesiumSync();
        sync.msgtype = 3; //should be chenged to 2...
		sync.id = selectID;
        console.log(sync)
		ws.send(sync.toArrayBuffer());
    } else {
        console.log("websocket undefinded in Sync/master")
    }
}
//End of part for selection

/*
//same as handleThreeFlags([true,true,true])
function handleAll() {
    console.log("Sending multiplier time play: ");

    if (ws != undefined) {
        var sync = new CesiumSync();
        sync.msgtype = 3;
		sync.play = playMaster;
		sync.time = viewer.clock.currentTime.toString();
        sync.multiplier = multMaster;
        ws.send(sync.toArrayBuffer());
    }

}
*/

function handleThreeFlags(input) {

	for (var i = 0 ; i<3; i++){
		if (input[i] == undefined)
			console.log("UNDEFINED");
	}

    if (ws != undefined) {
        var sync = new CesiumSync();
        sync.msgtype = 3;

		if (input[0]){
			sync.play = playMaster;
			console.log("play: " + playMaster );
		}
        if (input[1]){
			sync.multiplier = multMaster;
			console.log("multiplier: " + multMaster );
		}
		if (input[2]){
			sync.time = viewer.clock.currentTime.toString();
			console.log("time: " + viewer.clock.currentTime.toString() );
		}

        ws.send(sync.toArrayBuffer());
    } else {
        console.log("websocket undefinded in Sync/master")
    }

}





viewer.timeline.addEventListener('settime', handleSetTime, false);


//timed synchronization
window.setInterval(function() {
    if (toggleTimedSync) {
        console.log("*Timed Sync*")
	handleThreeFlags([true,true,true]);
    }
}, 5000)
