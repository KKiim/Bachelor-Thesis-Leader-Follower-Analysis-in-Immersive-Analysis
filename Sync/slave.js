

function handleStateChange(state) {
    console.log(state);

    if(state["time"]!=null) {
        console.log("TimeLine Update Rxd: "+state["time"]);
        setToMasterTime(state["time"]);
    }

    if (state["play"]!=null) {
        console.log("Play Update Rxd: "+ state["play"]);
        setToMasterPlay(state["play"]);
    }

    if(state["multiplier"]!=null) {
        console.log("TimeMultiplier Update Rxd: "+ state["multiplier"]);
        setToMasterMultiplier(state["multiplier"]);
    }

    if(state["id"]!=null) {
        console.log("SelctID Update Rxd: "+ state["id"]);
        setToMasterSelctID(state["id"]);
    }
}



var bing = new Cesium.BingMapsImageryProvider({
    url : 'http://dev.virtualearth.net',
    key : 'Aj36V6IYWMUkiI1_fOnxPyZxkODEupee3R4MbPCqhYZTDo3deX4UdC7Zc67H8zZf',
    mapStyle : Cesium.BingMapsStyle.AERIAL
});


var viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProvider : bing,
    baseLayerPicker : false,
    vrButton : true,
    animation: false
});


var clockViewModel = new Cesium.ClockViewModel(viewer.clock); //for the clock.multiplier
var animationViewModel = new Cesium.AnimationViewModel(clockViewModel); // for play/pause

var ws = new ReconnectingWebSocket(CONFIG.wsURI, null, {
    binaryType: 'arraybuffer'
});

ws.onopen = function() {
    console.log("WS Master-Slave Connection Achieved");
    ws.onmessage = function(evt) {


        try {
            // Decode the Message
            var sync = CesiumSync.decode(evt.data);

            /*
            Message Types:
            msgtype = 0 --> Slave Reload Message
            msgtype = 1 --> not used
            msgtype = 2 --> not used
            msgtype = 3 --> Cesium State Sync Message
            */
            if (sync.msgtype == 0) {
                console.log("Message-Type: Slave Reload Message Rxd");
                location.reload(true);
            } else if (sync.msgtype == 3) {
                console.log("Message-Type: State Update");
                handleStateChange(sync);
            }
        } catch (err) {
            console.log("Error: " + err);
        }
    };




};

function setToMasterTime(time) {
    console.log("Got time: "+time);
    viewer.clock.currentTime = Cesium.JulianDate.fromIso8601(time),
        // Update the Timeline to the Clock
        viewer.timeline.updateFromClock();
}

function setToMasterMultiplier(multiplier) {
    console.log("Got time: "+multiplier);
    clockViewModel.multiplier = multiplier;
    //viewer.clock.synchronize();
}

function setToMasterPlay(play) {
    console.log("Got play status: "+play);
    if (play) {
        animationViewModel.pauseViewModel.command();//This one is neccesary if the state before is not known!
        animationViewModel.playForwardViewModel.command();
        console.log(play);
    } else {
        animationViewModel.playForwardViewModel.command();//same here
        animationViewModel.pauseViewModel.command();
    }


}

function setToMasterSelctID(entityName) {

    let myEntities = viewer.entities.values;

    for (var  i = 0 ; i < myEntities.length; i++){
        let entity = myEntities[i]
        if (entity.name == entityName){ //entity.name is called Bird ID in GUI
            viewer.selectedEntity = entity;
            //viewer.trackedEntity = entity; 
        }
    }

}
