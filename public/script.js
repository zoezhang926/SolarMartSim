/*global $*/
/*global Cesium*/

Cesium.BingMapsApi.defaultKey = 'Ar9n20kTp-N8tEg3Dpx-Pgocmx3W0-GUnD_Bgt3h8g6pSeDL8yxByTVGHyMyjI2p';

var viewer = new Cesium.Viewer('cesiumContainer', {
    shadows: true
});

// Add Bing imagery
viewer.imageryLayers.addImageryProvider(new Cesium.BingMapsImageryProvider({
    url: 'https://dev.virtualearth.net',
    mapStyle: Cesium.BingMapsStyle.AERIAL // Can also use Cesium.BingMapsStyle.ROADS
}));

var url = "/SampleData/Miami_Sample.glb";
var height = 120;

viewer.entities.removeAll();

var position = Cesium.Cartesian3.fromDegrees(-80.193608, 25.762681, height);
var heading = Cesium.Math.toRadians(357);
var pitch = 0;
var roll = 0;
var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

var entity = viewer.entities.add({
    name: url,
    position: position,
    orientation: orientation,
    model: {
        uri: url,
        minimumPixelSize: 128,
        maximumScale: 20000
    }
});
viewer.trackedEntity = entity;


var poly_1 = viewer.entities.add({
    name: 'Roof_1',
    polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([-80.199115, 25.762748, 3.75, -80.199120, 25.762834, 3.75, -80.199173, 25.762832, 5.84, -80.199170, 25.762747, 5.84]),
        extrudedHeight: 0,
        perPositionHeight: true,
        material: Cesium.Color.WHITE.withAlpha(0.5),
        outline: true,
        outlineColor: Cesium.Color.BLACK
    },
    description: {
        general: "Roof at the east part of house",
        tilt: 24.61,
        azimuth: 147.3
    }
});

var poly_2 = viewer.entities.add({
    name: 'Roof_2',
    polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([-80.199125, 25.762835, 3.09, -80.199127, 25.762866, 3.09, -80.199198, 25.762864, 5.24, -80.199197, 25.762836, 5.24, -80.199173, 25.762832, 4.72]),
        extrudedHeight: 0,
        perPositionHeight: true,
        material: Cesium.Color.WHITE.withAlpha(0.5),
        outline: true,
        outlineColor: Cesium.Color.BLACK
    },
    description: {
        general: "Roof at the north part of house",
        tilt: 24.61,
        azimuth: 147.3
    }
});

var poly_3 = viewer.entities.add({
    name: 'Roof_3',
    polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([-80.199170, 25.762747, 5.84, -80.199173, 25.762832, 5.84, -80.199197, 25.762836, 5.24, -80.199198, 25.762864, 5.24, -80.199231, 25.762861, 3.75, -80.199226, 25.762744, 3.75]),
        extrudedHeight: 0,
        perPositionHeight: true,
        material: Cesium.Color.WHITE.withAlpha(0.5),
        outline: true,
        outlineColor: Cesium.Color.BLACK
    },
    description: {
        general: "Roof at the west part of house",
        tilt: 24.61,
        azimuth: 327.3
    }
});

viewer.flyTo(viewer.entities.values[0]);

setTimeout(function() {
    viewer.flyTo(viewer.entities.values[1]);
    setTimeout(function() {
        viewer.entities.remove(viewer.entities.values[0]);
    }, 2000);
}, 8000);

// HTML overlay for showing feature name on mouseover
var nameOverlay = document.createElement('div');
viewer.container.appendChild(nameOverlay);
nameOverlay.className = 'backdrop';
nameOverlay.style.display = 'none';
nameOverlay.style.position = 'absolute';
nameOverlay.style.bottom = '0';
nameOverlay.style.left = '0';
nameOverlay.style['pointer-events'] = 'none';
nameOverlay.style.padding = '4px';
nameOverlay.style.backgroundColor = 'black';

// Information about the currently selected feature
var selected = {
    feature: undefined,
    originalColor: new Cesium.Color()
};

// Information about the currently highlighted feature
var highlighted = {
    feature: undefined,
    originalColor: new Cesium.Color()
};

// An entity object which will hold info about the currently selected feature for infobox display
var selectedEntity = new Cesium.Entity();

// Color a feature yellow on hover.
viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
    // If a feature was previously highlighted, undo the highlight
    if (Cesium.defined(highlighted.feature)) {
        highlighted.feature.id.polygon.material = highlighted.originalColor.withAlpha(0.5);
        highlighted.feature = undefined;
    }

    // Pick a new feature
    var pickedFeature = viewer.scene.pick(movement.endPosition);
    if (!Cesium.defined(pickedFeature)) {
        nameOverlay.style.display = 'none';
        return;
    }

    // A feature was picked, so show it's overlay content
    nameOverlay.style.display = 'block';
    nameOverlay.style.bottom = viewer.canvas.clientHeight - movement.endPosition.y + 'px';
    nameOverlay.style.left = movement.endPosition.x + 'px';
    var name = pickedFeature.id.name;
    if (!Cesium.defined(name)) {
        name = pickedFeature.id.id;
    }
    nameOverlay.textContent = name;

    // Highlight the feature if it's not already selected.
    if (!Cesium.defined(selected.feature)) {
        highlighted.feature = pickedFeature;
        Cesium.Color.clone(pickedFeature.id.polygon.material, highlighted.originalColor);
        pickedFeature.id.polygon.material = Cesium.Color.YELLOW.withAlpha(0.5);
    }
    else if (Cesium.defined(selected.feature) && pickedFeature.id !== selected.feature.id) {
        highlighted.feature = pickedFeature;
        Cesium.Color.clone(pickedFeature.id.polygon.material, highlighted.originalColor);
        pickedFeature.id.polygon.material = Cesium.Color.YELLOW.withAlpha(0.5);
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// Color a feature on selection and show metadata in the InfoBox.
var clickHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
    // If a feature was previously selected, undo the highlight
    if (Cesium.defined(selected.feature)) {
        selected.feature.id.polygon.material = selected.originalColor.withAlpha(0.5);
        selected.feature = undefined;
    }

    // Pick a new feature
    var pickedFeature = viewer.scene.pick(movement.position);
    if (!Cesium.defined(pickedFeature)) {
        clickHandler(movement);
        return;
    }

    // Select the feature if it's not already selected
    if (selected.feature === pickedFeature) {
        return;
    }
    selected.feature = pickedFeature;

    // Save the selected feature's original color
    if (pickedFeature === highlighted.feature) {
        Cesium.Color.clone(highlighted.originalColor.withAlpha(0.5), selected.originalColor);
        highlighted.feature = undefined;
    }
    else {
        Cesium.Color.clone(pickedFeature.id.polygon.material, selected.originalColor);
    }

    // Highlight newly selected feature
    pickedFeature.id.polygon.material = Cesium.Color.LIME.withAlpha(0.5);

    // Set feature infobox description
    var featureName = pickedFeature.id.name;
    selectedEntity.name = featureName;
    selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
    viewer.selectedEntity = selectedEntity;
    selectedEntity.description = '<table class="cesium-infoBox-defaultTable"><tbody>' +
        '<tr><th>General</th><td>' + pickedFeature.id.description._value.General + '</td></tr>' +
        '<tr><th>Surface Tilt</th><td>' + pickedFeature.id.description._value.tilt + '</td></tr>' +
        '<tr><th>Surface Azumith</th><td>' + pickedFeature.id.description._value.azimuth + '</td></tr>' +
        '</tbody></table>';
    // modify the roof tilt and azimuth data in form
    $("input[id='roofTilt']").prop("value", pickedFeature.id.description._value.tilt);
    $("input[id='roofAzimuth']").prop("value", pickedFeature.id.description._value.azimuth);
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
