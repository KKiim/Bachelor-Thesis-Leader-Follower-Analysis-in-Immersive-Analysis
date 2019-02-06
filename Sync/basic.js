
// Grant CesiumJS access to your ion assets
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlODFhMWZjNC0xMTRhLTQzYTQtYTQzZC00NTdjNDBmNDRhNTIiLCJpZCI6NzQzMywic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0OTM4MjM3NH0.q9NM48tnc6XXXBV_axAGUfwCR2hF3lmtCC3ZKcML30o';




var viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayerPicker : false,
    vrButton : true,
    //terrainProvider : Cesium.createWorldTerrain()
});

var imageryLayer = viewer.imageryLayers.addImageryProvider(
    new Cesium.IonImageryProvider({ assetId: 2 })
);

viewer.zoomTo(imageryLayer)
    .otherwise(function (error) {
        console.log(error);
});





//here one may add features that must not be used in sync Mode
