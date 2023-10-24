/* eslint-disable prefer-const */
/* eslint-disable func-names */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-const-assign */
/* eslint-disable no-continue */
/* eslint-disable no-case-declarations */
/* eslint-disable no-cond-assign */
/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */


/** Sections: last updated 24 Set
 * UI CONFIGURATION
 * MAP CUSTOM CONTROL
 * MAP
 * Movement Nodes
 * ContextMenus
 * Markers
 * COLORS
 * Nodes TABLE
 * BINDING
 * Groups Table
 * Groups Operations
 * Buttons View
 * LOAD & SAVE OPERATIONS
 * Emulators View
 * HTTP Operations
 * DATA
 * TODO
 */

let openRouteServiceApiKey = '';
let pageUrl = '';

// marker icons these values are set on map startup using setUrlPath();
let redIcon = '';
let blueIcon = '';
let greenIcon = '';
let yellowIcon = '';

const red = 'FE6256';
const blue = '56CEFE';
const green = '91FE56';

let map;

const cmdsDone = []; // Array of arrays, [[operations, data],[operation, data],etc]
let cmdsToCommit = []; // Commands done available to commit
// const errormsg = ''; // Used to store error messages when needed

let lat; // stores latitude location when we click on the map
let lng; // stores longitude location when we click on the map
let currentId = 0; // Id for markers
let networkDeleted = false; // controls the nodes ID. Turn = true if the topology cleared and false by creating first marker
let CurrentSelectedMarker = null; // id of the latest clicked marker

let currentJoinChoices = null;

let previousEmusData = ''; // saves the emulators list as a JSON string.
let emulators = []; // stores available emulators
//const emulators = ['e1', 'e2', 'e3', 'e4']; // for testing
let emulatorsData = new Map(); // pcIp => emulators data string
let binds = new Map(); // key(id)=>emu
let previousBind = '-'; // storeS the current/previous value each time we click on the bind button

let markers = new Map(); // (key(id) = marker)
let circles = new Map(); // (key(marker id) = circle)

let groups = new Map(); // key(GO node) => values([nodes...])

// Context menus
let menuDisplayed = false;
// Context menu when we right-click on map
const mapMenuBox = document.getElementById('mapmenu');
// Context menu when we click on a marker
const markerMenu = document.getElementById('markermenu');
const markerMenuOptions = document.getElementById('markermenuoptions');
const markerMenuChoices = document.getElementById('markermenuchoices');
// options inside context menu on markers
const checkboxForm = document.getElementById('checkboxform');
const checkboxButton = document.getElementById('checkboxesbtn');
const creategroupOption = document.getElementById('creategroup');
const joingroupOption = document.getElementById('joingroup');
const leavegroupOption = document.getElementById('leavegroup');
const deletegroupOption = document.getElementById('deletegroup');
const moveOption = document.getElementById('movenode');

// Map custom controls
let moveModeDiv;
let moveStartBtn;
let moveStopBtn;
let configBtn;

// Ui configurations;
// const movementMode = 'event'; // drag or event(default)
const autoEmuRefresh = true; // true default
let autoBind = false; // false default
let autoAlert = true; // true default, is used to trigger groups formation alerts
let modeOfTravel;
let modeOfTravelString = 'walking';
let selectedDistance = 5; // 5 default (this and walking time gives a default movement speed of nodes = 5m/s)
let walkingTime = 1000; // 1000 ms default
const maxPathSize = 5000; // 5000m (5km)
let wifiDirectRange = 50; // 50m default

// Dragable flag for markers
let draggable = true;

// Move event variables
let askingForDestination = false;
let directionsService = null;
let eventactive = false;
let stop = false;
let pause = false;

let routesdrawn = new Map(); // key(nodeId) => value(route polyline)
let movementPaths = new Map(); // key(nodeId) => value(Array[latlng objects])

let pauseAlertMsg = '';


let leftContextmenu;
let topContextmenu;
let leftDivergence;
let topDivergence;
let mapResized = false;
let mapDragged = false;
let draggedDistance;

// shows if there is need for updating emulators list when adding first marker/node
let flagEmulatorsView = false;


// Sets warning when page is closed or refreshed
// eslint-disable-next-line func-names
window.onbeforeunload = function () {
    return true;
};


/*
* This method initiate javaScript files and start the map
* In current version scripts are loaded in the html file
* */
function loadMapScript(){
    // //Leaflet js file
    // const scriptLeaflet = document.createElement('script');
    // scriptLeaflet.type = 'text/javascript';
    // scriptLeaflet.src = 'https://unpkg.com/leaflet@1.8.0/dist/leaflet.js';
    // scriptLeaflet.integrity = 'sha512-BB3hKbKWOc9Ez/TAwyWxNXeoV9c1v6FIeYiBieIWkpLjauysF18NzgR1MBNBXf8/KABdlkX68nAhlwcDFLGPCQ==';
    // scriptLeaflet.crossOrigin = '';
    // document.body.appendChild(scriptLeaflet);
    //
    // //Leaflet Context Menu js file
    // const scriptContextMenu = document.createElement('script');
    // scriptContextMenu.type = 'text/javascript';
    // scriptContextMenu.src = 'scripts/leaflet.contextmenu.js';
    // document.body.appendChild(scriptContextMenu);
    //
    // //Leaflet Routing Machine js file
    // const scriptRoutingMachine = document.createElement('script');
    // scriptRoutingMachine.type = 'text/javascript';
    // scriptContextMenu.src = 'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js';
    // document.body.appendChild(scriptRoutingMachine);
    //
    // //Open Route Service js file
    // const scriptOpenRouteService = document.createElement('script');
    // scriptOpenRouteService.type = 'text/javascript';
    // scriptOpenRouteService.src = 'scripts/L.Routing.OpenRouteServiceV2.js';
    // document.body.appendChild(scriptOpenRouteService);
    //
    // //Leaflet Geometry Util
    // const scriptLeafletGeometryUtil = document.createElement('script');
    // scriptLeafletGeometryUtil.type = 'text/javascript';
    // scriptLeafletGeometryUtil.src = 'scripts/leaflet.geometryutil.js';
    // document.body.appendChild(scriptLeafletGeometryUtil);

    myMap();
}
// /////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////// -- UI CONFIGURATION -- ////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line no-unused-vars
// Confirms the options in UI configuration window (the window can be accessed by clicking setting button).
function confirmConfiguration() {
    const previousWifiRange = wifiDirectRange;
    /* const previousMoveMode = movementMode;
    if (document.getElementById('drag').checked) {
      movementMode = 'drag';
    } else {
      movementMode = 'event';
    } */

    /* if (document.getElementById('autoRefreshOn').checked) {
      autoEmuRefresh = true;
    } else {
      autoEmuRefresh = false;
    } */

    if (document.getElementById('autoBindOn').checked) {
        autoBind = true;
    } else {
        autoBind = false;
    }

    if (document.getElementById('autoAlertOn').checked) {
        autoAlert = true;
    } else {
        autoAlert = false;
    }

    const movementSpeed = document.getElementById('movementspeed').value;
    if (movementSpeed !== modeOfTravelString) {
        setMovementSpeed(movementSpeed);
    }

    wifiDirectRange = parseInt((document.getElementById('wifiRange').value), 10);
    if (previousWifiRange !== wifiDirectRange) {
        changeWifiDirectRange();
    }

    document.getElementById('configModal').style.display = 'none';

}

/*
* This function set the movement type and speed.
* */
function setMovementSpeed(mode) {
    if (movementPaths.size !== 0) {
        deleteAllPolylines();
        deleteAllRoutes();
    }

    if (mode === 'bicycling') { // 10m/s
        modeOfTravel = 'cycling-regular';
        modeOfTravelString = 'bicycling';
        selectedDistance = 10;
        walkingTime = 1000;
    } else if (mode === 'driving') { // 20m/s
        modeOfTravel = 'driving-car';
        modeOfTravelString = 'driving';
        selectedDistance = 20;
        walkingTime = 1000;
    } else { // default walking 5m/s
        modeOfTravel = 'foot-walking';
        modeOfTravelString = 'walking';
        selectedDistance = 5;
        walkingTime = 1000;
    }
}

// eslint-disable-next-line no-unused-vars
// Resets the options in UI configuration window (the window can be accessed by clicking setting button).
function cancelConfiguration() {
    console.log("[$cancelConfiguration> cancel clicked");
    if (autoBind) {
        document.getElementById('autoBindOn').checked = true;
        document.getElementById('autoBindOff').checked = false;
    } else {
        document.getElementById('autoBindOn').checked = false;
        document.getElementById('autoBindOff').checked = true;
    }

    if (autoAlert) {
        document.getElementById('autoAlertOn').checked = true;
        document.getElementById('autoAlertOff').checked = false;
    } else {
        document.getElementById('autoAlertOn').checked = false;
        document.getElementById('autoAlertOff').checked = true;
    }

    document.getElementById('movementspeed').value = modeOfTravelString;
    document.getElementById('wifiRange').value = `${wifiDirectRange}`;

    document.getElementById('configModal').style.display = 'none';
}

/*
* This function change the WiFiDirect range.
* The function is called by 'confirmConfiguration' function
* */
function changeWifiDirectRange() {
    // sets radius for each marker
    circles.forEach((value, key) => {
        value.setRadius(wifiDirectRange);
    });

    markers.forEach((value, key) => {
        const currentCoords = value.getLatLng();
        processMovement(key, value, currentCoords.lat, currentCoords.lng); // Processes movement command.
    });
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////// -- MAP CUSTOM CONTROLS -- //////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

// Creates switch tables button dive in the UI at first (when creating the map).
// By clicking this button, user can switch between nodes and groups tables.
function switchTablesBtn() {
    L.Control.switchTablesBtn = L.Control.Layers.extend({
        options: {
            position: 'bottomright'
        },
        onAdd: function (){
            const mainDiv = document.createElement('div');
            mainDiv.className = 'custom-control-container';

            const stylingDiv = document.createElement('div');
            stylingDiv.className = 'gm-style-mtc';

            switchTableDiv = document.createElement('BUTTON');
            switchTableDiv.className = 'custom-control';
            switchTableDiv.id = 'switchTableBtn';
            switchTableDiv.setAttribute('onclick', 'switchTables();');
            switchTableDiv.title = 'Click to switch between nodes and groups tables.';
            switchTableDiv.innerHTML = ' <span class="glyphicon glyphicon-new-window"></span>';

            stylingDiv.appendChild(switchTableDiv);
            mainDiv.appendChild(stylingDiv);
            return mainDiv;
        },
        onRemove: function (){
            // Nothing to do here
        }
    });
}

// Creates move mode control (button) dive in the UI at first (when creating the map).
function moveModeControl() {

    L.Control.moveModeControl = L.Control.Layers.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function (){
            const mainDiv = document.createElement('div');
            mainDiv.className = 'custom-control-container';

            const stylingDiv = document.createElement('div');
            stylingDiv.className = 'gm-style-mtc';

            moveModeDiv = document.createElement('div');
            moveModeDiv.className = 'custom-control';
            moveModeDiv.id = 'moveMode';
            moveModeDiv.innerHTML = 'Move event';

            stylingDiv.appendChild(moveModeDiv);
            mainDiv.appendChild(stylingDiv);
            return mainDiv;
        },
        onRemove: function (){
            // Nothing to do here
        }
    });
}

// Creates move start control (button) dive in the UI at first (when creating the map).
function moveStartControl() {
    L.Control.moveStartControl = L.Control.Layers.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function (){
            const mainDiv = document.createElement('div');
            mainDiv.className = 'custom-control-container';

            const stylingDiv = document.createElement('div');
            stylingDiv.className = 'gm-style-mtc';

            moveStartBtn = document.createElement('BUTTON');
            moveStartBtn.className = 'custom-control';
            moveStartBtn.id = 'moveStart';
            moveStartBtn.setAttribute('onclick', 'moveStartClicked();');
            moveStartBtn.title = 'Click to start or pause the node movement event.';
            moveStartBtn.innerHTML = ' <span class="glyphicon glyphicon-play"></span><span class="glyphicon glyphicon-pause"></span>';

            stylingDiv.appendChild(moveStartBtn);
            mainDiv.appendChild(stylingDiv);
            return mainDiv;
        },
        onRemove: function (){
            // Nothing to do here
        }
    });
}

// Creates move stop control (button) dive in the UI at first (when creating the map).
function moveStopControl() {
    L.Control.moveStopControl = L.Control.Layers.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function (){
            const mainDiv = document.createElement('div');
            mainDiv.className = 'custom-control-container';

            const stylingDiv = document.createElement('div');
            stylingDiv.className = 'gm-style-mtc';

            moveStopBtn = document.createElement('BUTTON');
            moveStopBtn.className = 'custom-control';
            moveStopBtn.id = 'moveStop';
            moveStopBtn.setAttribute('onclick', 'moveStopClicked();');
            moveStopBtn.title = 'Click to stop the node movement event.';
            moveStopBtn.innerHTML = ' <span class="glyphicon glyphicon-stop"></span>';

            stylingDiv.appendChild(moveStopBtn);
            mainDiv.appendChild(stylingDiv);
            return mainDiv;
        },
        onRemove: function (){
            // Nothing to do here
        }
    });
}

// Creates config/setting control (button) dive in the UI at first (when creating the map).
function configControl() {
    L.Control.configControl = L.Control.Layers.extend({
        options: {
            position: 'bottomleft'
        },
        onAdd: function (){

            const mainDiv = document.createElement('div');
            mainDiv.className = 'custom-control-container';

            const stylingDiv = document.createElement('div');
            stylingDiv.className = 'gm-style-mtc';

            configBtn = document.createElement('BUTTON');
            configBtn.className = 'custom-control';
            configBtn.id = 'configBtn';
            configBtn.disabled = false;
            configBtn.setAttribute('data-toggle', 'modal');
            // configBtn.setAttribute('data-target', '#configModal');
            configBtn.setAttribute('data-target', '#configModal');
            configBtn.setAttribute('onclick', 'confButtonClicked();');
            configBtn.title = 'Click to open the configuration menu. Unavailable if a movement event is active.';
            configBtn.innerHTML = '<span class="glyphicon glyphicon-cog" style="font-size: 16px; display:table-cell; vertical-align:middle;"></span>';

            stylingDiv.appendChild(configBtn);
            mainDiv.appendChild(stylingDiv);
            return mainDiv;
        },
        onRemove: function (){
            // Nothing to do here
        }
    });
}

// eslint-disable-next-line no-unused-vars
// Hides all menus and setting options if event is active.
function confButtonClicked() {
    hideAllMenus();

    if (eventactive) {
        var modal = document.getElementById("configModal");
        modal.style.display = "block";

        document.getElementById('configMovement').style.display = 'none';
        document.getElementById('configWifiDirectRange').style.display = 'none';

    } else {
        document.getElementById('configModal').style.display = 'block';
        document.getElementById('configMovement').style.display = 'block';
        document.getElementById('configWifiDirectRange').style.display = 'block';
    }
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////// -- MAP -- //////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

// This function starts the map, adds UI buttons for movement and creat contextmenu.
function myMap(){
    hideAllMenus();
    modeOfTravel = 'foot-walking';
    document.getElementById('groupstable').style.display = 'none';

    const mapCanvas = document.getElementById('map');

    map = L.map(mapCanvas, {
        // show context menu when we rigth-click anywhere on the map
        contextmenu: true,
    }).setView([59.9139, 10.7522], 18);

    //Original version of tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //Disable the zoom on click option
    map.touchZoom.disable();
    map.doubleClickZoom.disable();

    // Create the DIVs to hold the custom control for markers movement modes
    const moveModeDiv = moveModeControl();
    map.addControl(new L.Control.moveModeControl());

    const moveStartDiv = moveStartControl();
    map.addControl(new L.Control.moveStartControl());

    const moveStopDiv = moveStopControl();
    map.addControl(new L.Control.moveStopControl());

    const configControlDiv = configControl();
    map.addControl(new L.Control.configControl());
    //

    // Switch tables button
    const switchTableBtn = switchTablesBtn();
    map.addControl(new L.Control.switchTablesBtn());

    // eslint-disable-next-line no-restricted-syntax
    map.on("contextmenu", function (e){

        lat = e.latlng.lat;
        lng = e.latlng.lng;

        // show context menu when we right-click anywhere on the map
        resetMarkerColor(CurrentSelectedMarker);
        if (menuDisplayed === true) {
            hideAllMenus();
        }

        const left = e.layerPoint.x;
        const top = e.layerPoint.y;

        if (!mapDragged && !mapResized){

            leftContextmenu = left;
            topContextmenu = top;

            mapMenuBox.style.left = `${leftContextmenu}px`;
            mapMenuBox.style.top = `${topContextmenu}px`;
            mapMenuBox.style.display = 'block';
        }else if(mapDragged || mapResized) {

            leftContextmenu = left + leftDivergence;
            topContextmenu = top + topDivergence;

            mapMenuBox.style.left = `${leftContextmenu}px`;
            mapMenuBox.style.top = `${topContextmenu}px`;
            mapMenuBox.style.display = 'block';

        }
        menuDisplayed = true;
    });

    // Hides all menus
    map.on('dragstart', function (){hideAllMenus();});

    // Changes the map context menu position
    map.on('dragend', function (e){
        let diffX = 0;
        let diffY = 0;
        const overlayPaneBoundingRect = map.getPane('overlayPane').getBoundingClientRect();
        if (overlayPaneBoundingRect instanceof DOMRect) {
            diffX = overlayPaneBoundingRect.x;
            diffY = overlayPaneBoundingRect.y;
        }

        leftDivergence = diffX;
        topDivergence = diffY;

        mapDragged = true;
        mapResized = false;
    });

    // Handles map resize
    map.on('resize', function (e){
        let diffX = 0;
        let diffY = 0;
        const overlayPaneBoundingRect = map.getPane('overlayPane').getBoundingClientRect();
        if (overlayPaneBoundingRect instanceof DOMRect) {
            diffX = overlayPaneBoundingRect.x;
            diffY = overlayPaneBoundingRect.y;
        }

        leftDivergence = diffX;
        topDivergence = diffY;

        mapResized = true;
        mapDragged = false;
        hideAllMenus();
    });

    // turns all context menus off if we click out of them
    map.on('click', function (e){

        const left = e.layerPoint.x;
        const top = e.layerPoint.y;

        mapMenuBox.style.left = `${left}px`;
        mapMenuBox.style.top = `${top}px`;

        const destLatLng = [e.latlng.lat, e.latlng.lng];
        if (askingForDestination) {
            createRoute(CurrentSelectedMarker, destLatLng);
            askingForDestination = false;
        }
        resetMarkerColor(CurrentSelectedMarker);
        if (menuDisplayed === true) {
            hideAllMenus();
        }
    });

    document.getElementById('buttonsviewid').addEventListener('click', () => {
        resetMarkerColor(CurrentSelectedMarker);
        hideAllMenus();
    });

    document.getElementById('rigthsectionid').addEventListener('click', () => {
        resetMarkerColor(CurrentSelectedMarker);
        hideAllMenus();
    });

    setMapMenuListeners();
    setMarkerMenuListeners();
}

/*
* This function provides the URL of the UI folder.
* */
function setUrlPath(){

    const fullUrl = document.URL.toString();
    if (fullUrl.indexOf('indexOpenStreetMap.html') !== -1) {
        const splitURL = fullUrl.split('indexOpenStreetMap');
        pageUrl = splitURL[0];

        setMarkerIconsUrls(pageUrl);
    } else if (fullUrl.indexOf('/Termite2UI_OpenStreetMap/Webpage/') !== -1) {
        const midURL = fullUrl.split('Termite2UI_OpenStreetMap/WebPage/');
        pageUrl = midURL[0];

        setMarkerIconsUrls(pageUrl);
    } else if (fullUrl.indexOf('/Termite2UI_OpenStreetMap/') !== -1) {

        setMarkerIconsUrls(pageUrl);
    }
}

// This function sets the markers' icon.
function setMarkerIconsUrls(baseUrl){
    redIcon = `${baseUrl}icons/red.png`;
    blueIcon = `${baseUrl}icons/blue.png`;
    greenIcon = `${baseUrl}icons/green.png`;
    yellowIcon = `${baseUrl}icons/yellow.png`;
}

/*
* This function sets the OpenRouteService API key which is needed for routing.
* The website for acquiring a key:
* https://openrouteservice.org
* */
function setOpenRoutServiceApiKey(){
    const keyFilePath = `${pageUrl}apikey_OpenRouteService.txt`;

    fetch(keyFilePath)
        .then((response) => response.text())
        .then((data) => {
            openRouteServiceApiKey = `${data}`;
            loadMapScript();
        });
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////// -- Movement modes -- ///////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * This function receives a route of coordinates and divides it in equal segments of X meters (selectedDistance)
 * @param {Array} route containing array of latlng objects
 */
function interpolateFullPath(route) {
    let numCoords = route.length;
    let interpolatedRoute = [];

    let firstRoundFor = true;

    for (numCoords; numCoords !== 1; numCoords--) {
        // We select the first 2 sequential coordinates on the route.
        let coord1;
        let coord2;

        /*
        * Since the json object returned from OpenRoutService server fills the route array
        * in createRout function the first value is different and contains string "LatLng"
        * To handel this at first round of the for loop  the marker lat and lng are used instead of the first value.
        * And for others, the first 2 sequential coordinates on the route are selected.
        * */
        if (firstRoundFor){
            coord1 = [markers.get(CurrentSelectedMarker).getLatLng().lat, markers.get(CurrentSelectedMarker).getLatLng().lng];
            coord2 = route[1];

            firstRoundFor = false;
        }else {
            coord1 = route[0];
            coord2 = route[1];
        }

        var coord1Leaflet = L.latLng(coord1);
        var coord2Leaflet = L.latLng(coord2);

        const distance = coord1Leaflet.distanceTo(coord2Leaflet);

        // This is to handle the last distance after all route coordinates are evaluated.
        if (distance < selectedDistance && numCoords === 2) {
            interpolatedRoute.push(coord2);
            // If distance is equal to the selectedDistance we add it to the interpolated route and interpolate next distance.
        } else if (Math.round(distance) === selectedDistance
            || Math.round(distance) === selectedDistance + 1) {
            interpolatedRoute.push(coord2);
            route.shift();
            // If distance is smaller than selectedDistance we select the next destination coordinate and mantain the origin.
        } else if (distance < selectedDistance) {
            route.shift();
            route.shift();
            route.unshift(coord1);
            // If distance is greater than selectedDistance we interpolate the coordinates.
        } else if (distance > selectedDistance) {
            let fraction = (selectedDistance / distance);
            fraction = Math.round((fraction + Number.EPSILON) * 100) / 100;
            // Create new interpolated coordinate.
            const newCoord = L.GeometryUtil.interpolateOnLine(map,[coord1Leaflet,coord2Leaflet],fraction).latLng;

            // string of Lat and Lng are used to set markers' lat and lng.
            const newCoordLatLng = [newCoord.lat, newCoord.lng];

            route.shift();
            route.unshift(newCoordLatLng);
            interpolatedRoute.push(newCoordLatLng);

            numCoords++;
        }
    }
    return interpolatedRoute;
}

// This function calculate distance between two nodes.
function printDistances(path) {
    // Length of the whole path
    const pathStart = L.latLng(path[0][0],path[0][1]);
    const pathEnd = L.latLng(path[path.length - 1][0], path[path.length - 1][1]);
    const pathMeters = pathStart.distanceTo(pathEnd);

    for (let i = 0; i < path.length; i++) {
        if (i === (path.length - 1)) { break; }
        //const from = path[i];
        const from = L.latLng(path[i][0],path[i][1]);
        //const to = path[(i + 1)];
        const to = L.latLng(path[(i+1)][0],path[(i+1)][1]);
        const distance = from.distanceTo(to);
    }
}

// This function deletes all routes layer from map and instantiates the routesdrawn array again to clean previous routes.
function deleteAllPolylines() {
    routesdrawn.forEach((value,key) =>{
        map.removeLayer(routesdrawn.get(key));
    });
    routesdrawn = new Map();
}

/*
* This function instantiate the movementPath array again to clean previous paths.
* */
function deleteAllRoutes() {
    movementPaths = new Map();
}

// Returns true if two nodes/markers have a group in common.
function groupInCommon(node1, node2) {
    const groupsIn1 = getGroupsPartOf(node1);
    const groupsIn2 = getGroupsPartOf(node2);

    // check if they have a group in common, this does not count each others own groups
    let result = groupsIn1.some((group) => groupsIn2.includes(group));
    // finally check if they are in each others groups
    if ((isGoNode(node1) && groups.get(node1).includes(node2)) || (isGoNode(node2) && groups.get(node2).includes(node1))) {
        result = true;
    }

    return result;
}

// Checks if by movement of the marker the groups change or not. If yes, updates the groups.
function processNodeMovementEvent(id, marker, snappedlat, snappedlng, finalMove) {
    marker.setLatLng([snappedlat,snappedlng]); // Snaps marker.
    dragCircle(id,[snappedlat,snappedlng]); // Added to move the circle with the marker
    updateTable(id, snappedlat, snappedlng);
    const groupsIn = getGroupsPartOf(id); // Returns groups' IDs that the input node (marker) is member of them.
    const nodesInRange = getNodesInRage(id); // Returns an array with nodes (markers) in the range of the input node (marker).
    const membersleft = [];
    const groupsleft = [];

    // automatic normal verifications (to leave group or remove members)
    if (isGoNode(id)) { // I'm a go node.
        const myGMembers = groups.get(id);
        myGMembers.forEach((member) => { // for each member in my group lets check if they are still in range.
            if (!inRange(id, member)) { // if not in range
                processOperation(['move', id, snappedlat, snappedlng, getNeighbors(id)]);
                leaveGroup(member, id);
                membersleft.push(member);
            }
        });
    }
    if (groupsIn !== 0) { // I belong to other group/s.
        groupsIn.forEach((groupGo) => { // for each group im part of, check if im still in range of go node
            if (!inRange(id, groupGo)) { // if not in range
                processOperation(['move', id, snappedlat, snappedlng, getNeighbors(id)]);
                leaveGroup(id, groupGo);
                groupsleft.push(groupGo);
            }
        });
    }

    // Alert for members leaving node group or node leaving others groups
    if (autoAlert && (membersleft.length !== 0 || groupsleft.length !== 0)) {
        let alertMsg = '';
        if (membersleft.length !== 0) {
            alertMsg += `Node/s (${membersleft}) no longer in range of GO node ${id}. Node/s (${membersleft}) left group ${id}.\n`;
        }
        if (groupsleft.length !== 0) {
            alertMsg += `Node ${id} no longer in range of GO node/s (${groupsleft}). Node ${id} left group/s (${groupsleft}).`;
        }
        alert(alertMsg);
    }

    // automatic move verifications (to join or create groups)
    if (nodesInRange !== 0) { // Neighbors exist.
        alertMsg = '';
        nodesInRange.forEach((neighbor) => { // for each neighbor in range.
            if (!groupInCommon(id, neighbor)) { // they don't have a group in common
                if (isGoNode(neighbor)) { // Neighbor is a go node. I JOIN.
                    processOperation(['move', id, snappedlat, snappedlng, getNeighbors(id)]);
                    joinGroup(id, neighbor);
                    cmdsToCommit.push('commit');
                    alertMsg += `Node ${id} joined group ${neighbor}.\n`;
                } else if (isGoNode(id)) { // Neighbor is not a go node but I'm. HE JOINS
                    processOperation(['move', id, snappedlat, snappedlng, getNeighbors(id)]);
                    joinGroup(neighbor, id);
                    cmdsToCommit.push('commit');
                    alertMsg += `Neighbor node ${neighbor} joined group ${id}.\n`;
                } else { // Neither I or the neighbor are go nodes has such i create a group and add neighbor to it.
                    processOperation(['move', id, snappedlat, snappedlng, getNeighbors(id)]);
                    createGroup(id, [`${neighbor}`]);
                    cmdsToCommit.push('commit');
                    alertMsg += `Group ${id} created with members (${id},${neighbor}).\n`;
                }
            }
        });
        if (autoAlert && alertMsg.length !== 0) {
            alert(alertMsg);
        }
    }

    if (finalMove === 1) {
        processOperation(['move', id, snappedlat, snappedlng, getNeighbors(id)]);
    }
}

// Increases the wait time if the last command is wait, otherwise issues new wait operation.
function incrementWaitTime(time) {
    const numCmds = cmdsDone.length;
    let newTime = time;
    if (newTime < 1) {
        newTime = Math.ceil(newTime);
    }
    if ((cmdsDone[numCmds - 1])[0] === 'wait') {
        const previousT = (cmdsDone[numCmds - 1])[1];
        newTime = parseInt(previousT, 10) + newTime;
        cmdsDone.pop();
        cmdsToCommit.pop();
    }
    processOperation(['wait', `${newTime}`]);
}

// Calculates the time (called wait time) is needed to travers the movement path and call the function for issuing wait operation.
function processMovementEvent(id, latLng, numActive, finalMove) {
    // walking time (default 1000ms) divided by the number of active paths
    const time = Math.round(walkingTime / numActive);
    return new Promise((resolve) => {
        setTimeout(() => {
            const marker = markers.get(id);
            incrementWaitTime(time);
            processNodeMovementEvent(id, marker, latLng[0], latLng[1], finalMove);
            resolve(true);
        }, time);
    });
}

// Deletes empty groups.
function deleteAllEmptyGroups() {
    groups.forEach((value, key) => {
        if (value.length === 0) {
            deleteGroup(key);
        }
    });
}

// Starts moving event to move markers.
async function startMoveEvent(){
    disableDrag();
    eventactive = true;
    moveStartBtn.style.background = '#008000';
    moveStartBtn.style.color = '#ffffff';
    while (movementPaths.size !== 0 && !stop && !pause) {
        // eslint-disable-next-line no-restricted-syntax
        for (const [key, value] of movementPaths) {
            const numActive = movementPaths.size;
            const finalMove = value.length; // this is used to set final movement position on path, even if no operation happens
            if (value[0] != null) {
                // eslint-disable-next-line no-await-in-loop
                await processMovementEvent(key, value[0], numActive, finalMove);
                value.shift(); // removes processed position
            } else {
                movementPaths.delete(key);
                map.removeLayer(routesdrawn.get(key));
                routesdrawn.delete(key);
            }
        }
    }

    if (pause) {
        processOperation(['pause']);
        alert(`${pauseAlertMsg}\nMovement Event paused.`);
        moveStartBtn.style.background = '#ffa500';
        moveStartBtn.style.color = '#000000';
        pauseAlertMsg = '';
        return;
    }

    deleteAllEmptyGroups(); // delete any empty group
    processOperation(['stop']);
    deleteAllPolylines();
    deleteAllRoutes();
    eventactive = false;
    stop = false;
    enableDrag();
    // sets default colors on btns
    moveStartBtn.style.background = '#ffffff';
    moveStartBtn.style.color = '#000000';
    alert('Movement Event stopped.');
}

/**
 * This function creates the routes!
 * @param nodeId the Id of the marker that we want to add a path to it.
 * @param destination array of string, consist of lat and lng of the destination
 */
function createRoute(nodeId, destination) {
    const start = markers.get(nodeId).getLatLng();

    const request = new XMLHttpRequest();

    const profile = modeOfTravel;

    request.open('GET', 'https://api.openrouteservice.org/v2/directions/' + profile + '?api_key=' + openRouteServiceApiKey + '&start=' + start.lng + ',' + start.lat + '&end=' + destination[1] + ',' + destination[0]);

    request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');

    request.onreadystatechange = function () {
        if (this.readyState === 4) {

            const pathStartPoint = L.latLng(start.lat,start.lng);
            const pathEndPoint = L.latLng(destination[0], destination[1]);
            const pathSizeMeters = pathStartPoint.distanceTo(pathEndPoint);

            if (pathSizeMeters > maxPathSize) { // path max length 5km
              alert('Selected point is to far away, please select point closer to the node current coordinates.');
              return;
            }

            if (routesdrawn.get(nodeId) != null) { // node already has a route, delete and create new one
                map.removeLayer(routesdrawn.get(nodeId));
                routesdrawn.delete(nodeId);
                movementPaths.delete(nodeId);
            }

            const json = JSON.parse(this.responseText);

            switch (this.status){
                case 200:
                    const route = L.geoJSON(json).addTo(map);

                    routesdrawn.set(nodeId, route);
                    const nodesInRoute = new Array();

                    for (i = 0; i < json.features[0].geometry.coordinates.length; i++){

                        const latLng = [json.features[0].geometry.coordinates[i][1],json.features[0].geometry.coordinates[i][0]];
                        nodesInRoute.push(latLng);
                    }
                    const interpolatedRoute = interpolateFullPath(nodesInRoute);
                    movementPaths.set(nodeId, interpolatedRoute);
                    break;

                case 400:
                    alert("Directions Request from ["+ start.lat + ", " +start.lng + "] to [" + destination[0] + ", " + destination[1] + "] failed: The request is incorrect and therefore can not be processed.");
                    break;
                case 401:
                    alert("Directions Request from ["+ start.lat + ", " +start.lng + "] to [" + destination[0] + ", " + destination[1] + "] failed: Unauthorized.");
                    break;
                case 403:
                    alert("Directions Request from ["+ start.lat + ", " +start.lng + "] to [" + destination[0] + ", " + destination[1] + "] failed: Forbidden.");
                    break;
                case 404:
                    alert("Directions Request from ["+ start.lat + ", " +start.lng + "] to [" + destination[0] + ", " + destination[1] + "] failed: An element could not be found. If possible, a more detailed error code is provided.");
                    break;
                case 405:
                    alert("Directions Request from ["+ start.lat + ", " +start.lng + "] to [" + destination[0] + ", " + destination[1] + "] failed: The specified HTTP method is not supported. For more details, refer to the EndPoint documentation.");
                    break;
                case 413:
                    alert("Directions Request from ["+ start.lat + ", " +start.lng + "] to [" + destination[0] + ", " + destination[1] + "] failed: The request is larger than the server is able to process, the data provided in the request exceeds the capacity limit.");
                    break;
                case 500:
                    alert("Directions Request from ["+ start.lat + ", " +start.lng + "] to [" + destination[0] + ", " + destination[1] + "] failed: An unexpected error was encountered and a more detailed error code is provided.");
                    break;
                case 501:
                    alert("Directions Request from ["+ start.lat + ", " +start.lng + "] to [" + destination[0] + ", " + destination[1] + "] failed: Indicates that the server does not support the functionality needed to fulfill the request.");
                    break;
                case 503:
                    alert("Directions Request from ["+ start.lat + ", " +start.lng + "] to [" + destination[0] + ", " + destination[1] + "] failed: The server is currently unavailable due to overload or maintenance.");
                    break;
                default:
                    alert(`Unknown error in response from OpenRoutService: Path is unavailable!`);
            }
        }
    };

    request.send();

    changeCursor('default'); // set cursor to default
    processOperation(['EventMove', nodeId, `${destination[0]}`, `${destination[1]}`]);
}

// eslint-disable-next-line no-unused-vars
// Adds a polyline from input array of LatLng on the map.
function setPathPolyline(route) {
    const polyline = L.polyline(route,{
        color: `#${red}`,
        opacity: 0.8,
        weight: 2,
    }).addTo(map);
}

// eslint-disable-next-line no-unused-vars
// Handles the move start (play) button click by calling related function and operation.
function moveStartClicked() {
    hideAllMenus();
    if (movementPaths.size === 0) {
        alert('No paths defined to start movement event.');
    } else if (eventactive && !pause) {
        pause = true;
    } else {
        pause = false;
        processOperation(['start']);
        startMoveEvent();
    }
}

// eslint-disable-next-line no-unused-vars
// Handles the move stop button and sets the stop variable.
// If we are in the pause mode, it will continue and then stop.
function moveStopClicked() {
    if (!eventactive && routesdrawn.size !== 0) {
        deleteAllPolylines();
        deleteAllRoutes();
        alert('All event paths deleted.');
    } else if (!eventactive) {
        alert('No events in course.');
    } else if (pause) {
        pause = false;
        stop = true;
        startMoveEvent();
    } else {
        stop = true;
    }
}

// Disables dragging feature of nodes/markers.
function disableDrag() {
    draggable = false;
    const allNodes = getAllNodes();
    allNodes.forEach((node) => {
        markers.get(node).dragging.disable();
    });
}

// Enables dragging feature of nodes/markers.
function enableDrag() {
    draggable = true;
    const allNodes = getAllNodes();
    allNodes.forEach((node) => {
        markers.get(node).dragging.enable();
    });
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////// -- ContextMenus -- /////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

// Hides all menus.
function hideAllMenus(){
    mapMenuBox.style.display = 'none';
    markerMenu.style.display = 'none';
    markerMenuOptions.style.display = 'none';
    markerMenuChoices.style.display = 'none';
    creategroupOption.style.display = 'none';
    joingroupOption.style.display = 'none';
    leavegroupOption.style.display = 'none';
    moveOption.style.display = 'none';
    deletegroupOption.style.display = 'none';
    clearAllChoices();
}

/**
 * This function shows the marker menu options relevant for the clicked not,
 * for example if a node is already a go node
 * the option to create group is not shown
 * @param {String} nodeId
 */
function setMarkerMenuOptions(nodeId) {
    moveOption.style.display = 'block';
    // check if it is goNode
    const goNode = isGoNode(nodeId);
    // if not
    if (!goNode) {
        creategroupOption.style.display = 'block';
    }
    // if yes
    if (goNode) {
        deletegroupOption.style.display = 'block';
    }
    // check if it belongs to group
    if (hasGroup(nodeId)) {
        leavegroupOption.style.display = 'block';
    }
    if (canJoinBeShown()) {
        joingroupOption.style.display = 'block';
    }
}

// Returns true if there is a group to join and saves those groups in currentJoinChoices array.
function canJoinBeShown() {
    const allGoNodes = getAllGoNodes();
    if (allGoNodes.length !== 0) {
        const goNodesClose = filterNodesInRage(CurrentSelectedMarker, allGoNodes);
        if (goNodesClose.length !== 0) {
            const ownGroupsRemoved = filterOwnGroups(CurrentSelectedMarker, goNodesClose);
            if (ownGroupsRemoved.length !== 0) {
                currentJoinChoices = ownGroupsRemoved;
                return true;
            }
        }
    }
    return false;
}

// This function set listener for map context menu.
function setMapMenuListeners(){
    // Adds marker on location when we click on the [Add Marker]
    document.getElementById('addmarker').addEventListener('click', () => {
        createMarker(null, lat, lng);
        hideAllMenus();
    });

    // Removes all markers from the map when we click on the [Delete all Nodes] and confirm
    document.getElementById('deleteallmarkers').addEventListener('click', () => {
        if (markers.size === 0) {
            alert('Theres no Node on the map!');
        } else if (confirm('Are you sure you want to clean/reset the current network topology?')) {
            deleteAllMarkers();
        }
        hideAllMenus();
    });
}

// This function sets listener for marker context menu.
function setMarkerMenuListeners() {
    // Shows marker that can join group creation
    document.getElementById('creategroup').addEventListener('click', () => {
        clearAllChoices();
        setCreateGroupChoices();
        markerMenuChoices.style.display = 'block';
    });

    // Shows the groups the marker can leave
    document.getElementById('leavegroup').addEventListener('click', () => {
        clearAllChoices();
        setLeaveGroupChoices();
        markerMenuChoices.style.display = 'block';
    });

    // Shows the groups the marker can join
    document.getElementById('joingroup').addEventListener('click', () => {
        clearAllChoices();
        setJoinGroupChoices();
        markerMenuChoices.style.display = 'block';
    });

    // Deletes group when clicked
    document.getElementById('deletegroup').addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete group ${CurrentSelectedMarker}?`)) {
            deleteGroup(CurrentSelectedMarker);
        }
        hideAllMenus();
    });

    // Start setup for moving marker using move event [Move Marker]
    document.getElementById('movenode').addEventListener('click', () => {
        //console.log("setMarkerMenuListeners > Move Node clicked!")
        hideAllMenus();
        askingForDestination = true;
        changeCursor('crosshair'); // change crosshair
    });

    // Removes marker on location when we click on the [Remove Marker]
    document.getElementById('removemarker').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this node?')) {
            deleteMarker(CurrentSelectedMarker);
        }
        hideAllMenus();
    });
}

// Clears all choices and checked boxes.
function clearAllChoices() {
    // eslint-disable-next-line eqeqeq
    if (!checkboxForm.textContent == '') {
        checkboxForm.textContent = '';
    }
}

// Shows nodes in the range of current node with checkbox to check and add the neighboring node to the group.
function setCreateGroupChoices() {
    checkboxButton.innerHTML = 'Create Group';
    const nodesInRage = getNodesInRage(CurrentSelectedMarker);
    nodesInRage.forEach((nodeId) => {
        const newdiv = document.createElement('div');
        newdiv.id = 'checkboxesdiv';
        newdiv.innerHTML = `<input type="checkbox" name="c" id="checkbox${nodeId}" value="${nodeId}">
    <label class="inputlabel" for="checkbox${nodeId}"><i class="glyphicon glyphicon-plus-sign"></i> Node ${nodeId}</label>`;
        checkboxForm.appendChild(newdiv);
    });
}

// Shows available groups with checkbox to choose from them and join the group.
function setJoinGroupChoices() {
    checkboxButton.innerHTML = 'Join Group(s)';
    currentJoinChoices.forEach((goNode) => {
        const newdiv = document.createElement('div');
        newdiv.id = 'checkboxesdiv';
        newdiv.innerHTML = `<input type="checkbox" name="c" id="checkbox${goNode}" value="${goNode}">
    <label class="inputlabel" for="checkbox${goNode}"><i class="glyphicon glyphicon-plus-sign"></i> Group ${goNode}</label>`;
        checkboxForm.appendChild(newdiv);
    });
}

// Shows groups that the node is part of them with checkbox to choose from them and leave that group.
function setLeaveGroupChoices() {
    checkboxButton.innerHTML = 'Leave Group(s)';
    const groupsPartOf = getGroupsPartOf(CurrentSelectedMarker);
    groupsPartOf.forEach((goNode) => {
        const newdiv = document.createElement('div');
        newdiv.id = 'checkboxesdiv';
        newdiv.innerHTML = `<input type="checkbox" name="c" id="checkbox${goNode}" value="${goNode}">
    <label class="inputlabel" for="checkbox${goNode}"><i class="glyphicon glyphicon-minus-sign"></i> Group ${goNode}</label>`;
        checkboxForm.appendChild(newdiv);
    });
}

// Returns the checked values in the UI.
function getCheckedOptions() {
    const checkedValues = [].filter.call(document.getElementsByName('c'), (c) => c.checked).map((c) => c.value);
    return checkedValues;
}

// eslint-disable-next-line no-unused-vars
// Handles selected three options (Create Group, Join Group, Leave Group) from markers' contextmenu.
function choicesButtonClicked() {
    const btnOperation = checkboxButton.innerHTML;
    const checkedNodes = getCheckedOptions();

    if (btnOperation === 'Create Group') {
        createGroup(CurrentSelectedMarker, checkedNodes);
    }
    if (btnOperation === 'Join Group(s)') {
        checkedNodes.forEach((goNode) => {
            joinGroup(CurrentSelectedMarker, goNode);
        });
    }
    if (btnOperation === 'Leave Group(s)') {
        checkedNodes.forEach((goNode) => {
            leaveGroup(CurrentSelectedMarker, goNode);
        });
    }
    // first get what choices were selected
    clearAllChoices();
    hideAllMenus();
    resetMarkerColor(CurrentSelectedMarker);
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////// -- Markers -- ////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

// Creates appropriate marker icon and returns it as an output.
function buildMarkerIcon(myIconUrl) {
    const markerIcon = L.icon({
        iconUrl: myIconUrl,
        //iconSize:     [20, 32], // size of the icon
        iconAnchor: [13.5, 16],  // point of the icon which will correspond to marker's location
    });
    return markerIcon;
}

/**
 * This function assigns an ID to a marker.
 * @param {String or null} idArg
 * @param {String} latitude
 * @param {String} longitude
 */
function createMarker(idArg, latitude, longitude){
    if (networkDeleted === true){
        currentId = 0;
        networkDeleted = false;
    }else{
        networkDeleted = false;
    }

    // If the marker is the first one, set the flag to true.
    if (markers.size == 0){
        flagEmulatorsView = true;
    }

    let id;

    // Verify/Generate marker id
    if (idArg != null) { // createMarker through load
        if (!(doesNodeExist(idArg))) {
            id = idArg;
        } else {
            alert(`Node ${idArg} already exists. Node not created.`);
            return;
        }
    } else { // createMarker through click
        id = `${newUniqueId()}`;
    }

    continueMarkerCreation(id, latitude, longitude);
}

// This function creates the marker, update node and groups tables
// Also, it binds an emulator to the node/marker if auto bind is active.
function continueMarkerCreation(id, snappedlat, snappedlng){
    const marker = L.marker([snappedlat,snappedlng], {
        icon: buildMarkerIcon(redIcon),
        draggable: true,
        //autoPan: true
    });
    marker.bindPopup(id);
    marker.featureId = id;
    map.addLayer(marker);

    createAndBindCircle(id, snappedlat, snappedlng);

    marker.on("drag", function(e) {
        marker.setLatLng(e.latlng);
        dragCircle(id, e.latlng);
    });

    markers.set(id, marker); // stores id=>marker in hash map

    addTableEntry(id, snappedlat, snappedlng); // Adds the new marker info to the data table view (in right side of the UI)

    const markerNeighbors = getNeighbors(id);

    processOperation(['createnode', id, marker.getLatLng().lat, marker.getLatLng().lng, markerNeighbors]); // logs operation
    setMarkerListeners(id, marker);

    if (autoBind) { // Set the first available node for binding if autoBind is enabled
        const availableBinds = getAvailableBinds();
        if (availableBinds.length !== 0) {
            previousBind = '-';
            document.getElementById(`dropform${id}`).value = `${getAvailableBinds()[0]}`;
            updateEmulatorBinds(`dropform${id}`, id);
        }
    }
}

// Creates and binds a circle to a specific marker
function createAndBindCircle(id, circleLat, circleLng) {
    const markerCircle = L.circle([circleLat,circleLng], { // creates a circle
        fillColor: `#${red}`,
        fillOpacity: 0.1,
        //radius: wifiDirectRange, // meters, Wi-fi Direct reaches up to 100m, phones normally have 50-80
        radius: 50,
        stroke: true,
        weight: 1, // Stroke weight
        color: '#000000', // Stroke color
        opacity: 0.2, // Stoke opacity -> mizane porrangi ro set mikone
        clickable: false,
        //contextmenu: true,
    });
    map.addLayer(markerCircle);
    circles.set(id, markerCircle); // stores circle obj in hash map
}

// Moves the circle when the associated marker is dragged.
function dragCircle(id, circleLatLng){
    const circleDragged = circles.get(id);
    circleDragged.setLatLng(circleLatLng);
}

// Sets all markers listeners
function setMarkerListeners(id, marker){
    let currentPosition;
    let newPosition;

    marker.on("click", function (){
        resetMarkerColor(CurrentSelectedMarker);
        CurrentSelectedMarker = `${marker.featureId}`;
        setColorBlue(CurrentSelectedMarker);
        if (menuDisplayed === true) {
            hideAllMenus();
        }
    });

    // Click listener
    marker.on("contextmenu", function (e){
        resetMarkerColor(CurrentSelectedMarker);
        CurrentSelectedMarker = `${marker.featureId}`;
        setColorBlue(CurrentSelectedMarker);

        if (menuDisplayed === true) {
            hideAllMenus();
        }

        const left = e.layerPoint.x;
        const top = e.layerPoint.y;

        if (!mapDragged && !mapResized){

            leftContextmenu = left;
            topContextmenu = top;

            markerMenu.style.left = `${leftContextmenu}px`;
            markerMenu.style.top = `${topContextmenu}px`;
            markerMenu.style.display = 'block';
            markerMenuOptions.style.display = 'block';
            setMarkerMenuOptions(marker.id);

            menuDisplayed = true;
        }else if(mapDragged || mapResized) {


            leftContextmenu = left + leftDivergence;
            topContextmenu = top + topDivergence;

            markerMenu.style.left = `${leftContextmenu}px`;
            markerMenu.style.top = `${topContextmenu}px`;
            markerMenu.style.display = 'block';
            markerMenuOptions.style.display = 'block';
            setMarkerMenuOptions(marker.id);

            menuDisplayed = true;
        }

    });

    // Mouse over listener
    marker.on("mouseover", function (e){
        // changeMarkerColor(id);
    });

    // Mouse out listener
    marker.on("mouseout", function (e){
        // resetMarkerColor(id);
    });

    // Drag start listener
    marker.on("dragstart", function (){
        currentPosition = marker.getLatLng();
        //console.log("drag started: " + currentPosition);
    });

    // Drag end listener
    marker.on("dragend", function (){
        newPosition = marker.getLatLng();
        moveMarker(id, newPosition.lat, newPosition.lng, currentPosition);
    });
}

// This function checks that the new dragged position is valid or not.
function moveMarker(id, newlat, newlng, oldcoords) {
    const marker = markers.get(id);
    processMovement(id, marker, newlat, newlng);
}

// This function moves the node/marker to the new location and update the groups.
function processMovement(id, marker, snappedlat, snappedlng) {
    marker.setLatLng([snappedlat,snappedlng]);
    updateTable(id, snappedlat, snappedlng); // Updates list of nodes in the right hand-side table.

    // checks that whether the group of the node will change by changing the location,
    // and update the group table regarding the check result.
    if (isGoNode(id)) {
        const leaves = [];
        gmembers = groups.get(id);
        for (i = 0; i < gmembers.length; i++) {
            const mem = gmembers[i];
            if (!inRange(id, mem)) {
                gmembers.splice(i, 1); //splice(start, deleteCount)
                i--;
                processOperation(['leavegroup', mem, `(${id})`]);
                leaves.push(mem);
            }
        }
        updateGroupsTable(id);
        if (leaves.length !== 0 && autoAlert) {
            alert(`Node(s) "${leaves}" no longer in range of GO node "${id}".\nNode(s) "${leaves}" left group "${id}".`);
        }
    }

    // checks that whether the groups of the node will change by changing the location,
    // and update the group table regarding the check result.
    const groupsIn = getGroupsPartOf(id);
    const leftgroups = [];
    if (groupsIn.length !== 0) { // Node was in a group/s
        groupsIn.forEach((goNode) => {
            if (!inRange(goNode, id)) {
                leaveGroup(id, goNode);
                leftgroups.push(goNode);
            }
        });
        // eslint-disable-next-line eqeqeq
        if (leftgroups.length !== 0 && autoAlert) {
            alert(`Node "${id}" no longer in range of GO node/s "${leftgroups}".\nNode "${id}" left group/s "${leftgroups}".`);
        }
    }

    const neighborsString = getNeighbors(id);
    processOperation(['move', id, snappedlat, snappedlng, neighborsString]);
}

/**
 * Removes marker with id received has paramenter from the network
 * When removing it checks id node is Go node, if so deletes group first
 * It also checks if node is member of some group, if so it first removes the node from those groups.
 * @param {String} id
 */
function deleteMarker(id) { // deletes marker with corresponding id
    const marker = markers.get(id); // find the marker by given id
    const circle = circles.get(id); // find the binded circle to the marker by given id
    const bindedEmu = binds.get(id); // Remove bind if exists
    const memberOfGroups = getGroupsPartOf(id); // Returns groups' IDs that the input node (marker) is member of them.
    if (bindedEmu != null) {
        removeBind(id, bindedEmu);
        updateAllAvailableEmuOptions();
    }
    if (isGoNode(id)) { // check if node is GO, if so delete group first:
        deleteGroup(id);
    }
    // eslint-disable-next-line eqeqeq
    if (!memberOfGroups.length == 0) { // Check if node in a group and remove it
        memberOfGroups.forEach((goNode) => {
            leaveGroup(id, goNode);
        });
    }
    removeTableEntry(id);

    map.removeLayer(marker); // removes marker from map
    map.removeLayer(circle);

    circles.delete(id); // removes circle from circles
    markers.delete(id); // removes marker from markers
    processOperation(['deletenode', id]);
}

// Deletes all markers and paths by resetting related arrays.
function deleteAllMarkers(){
    networkDeleted = true;

    // Removes all markers from the map
    markers.forEach((value, key) => {
        map.removeLayer(value);
    });
    // Removes all circles from the map
    circles.forEach((value,key) => {
        map.removeLayer(value);
    });


    // hides the map menu after deleting the markers.
    hideAllMenus();

    resetAllTabels();
    // reset drawn routes if they exist
    deleteAllPolylines();
    deleteAllRoutes();
    // sets default colors on btns
    moveStartBtn.style.background = '#ffffff';
    moveStartBtn.style.color = '#000000';
    stop = false;
    pause = false;
    eventactive = false;
    // resets all maps
    circles = new Map();
    markers = new Map();
    binds = new Map();
    groups = new Map();
    currentId = 0;
    processOperation(['deleteall']);
}

// return a string with the nodes that are in range (node1,node2,...)
function getNeighbors(nodemoving) {
    let nodesInRange = '(';
    const allMarkers = getIdOfAllMarkers();
    const { length } = allMarkers;
    for (i = 0; i < length; i++) {
        const node = allMarkers[i];
        if (nodemoving !== node) {
            if (inRange(nodemoving, node)) {
                nodesInRange = `${nodesInRange + node},`;
            }
        }
    }
    const strlength = nodesInRange.length;
    if (strlength !== 1) {
        nodesInRange = nodesInRange.substring(0, nodesInRange.length - 1);
    }
    nodesInRange += ')';
    return nodesInRange;
}

// Returns an array with nodes (markers) in the range of the input node (marker).
function getNodesInRage(nodearg) {
    const nodesInRange = [];
    const allMarkers = getIdOfAllMarkers(); //Returns an array with all created markers IDs
    const { length } = allMarkers;
    for (i = 0; i < length; i++) {
        const node = allMarkers[i];
        if (nodearg !== node) {
            if (inRange(nodearg, node)) {
                nodesInRange.push(node);
            }
        }
    }
    return nodesInRange;
}

// Returns an array with all created markers id's
function getIdOfAllMarkers() {
    const idOfAllMarkers = Array.from(markers.keys());
    return idOfAllMarkers;
}

/**
 * Genrerates a newunique id.
 * Gets current id and increments its value, then verifies if the node already exists, if so icrements and checks again
 * When a unique id is found it returns the value
 */
function newUniqueId() { // Return new unique id for a marker and increments its value
    const newId = ++currentId;
    if (doesNodeExist(`${newId}`)) {
        currentId = newId;
        return newUniqueId();
    }
    return currentId;
}

/**
 * This function checks if the node passed has argument exists or not
 * If yes returns true, otherwise returns false.
 * @param {String} nodeId
 */
function doesNodeExist(nodeId){
    if (getAllNodes().includes(nodeId)) {
        return true;
    }
    return false;
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////// -- COLORS -- ///////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

// Changes the color of the input marker and its circle to red.
function setColorRed(node) {
    markers.get(String(node)).setIcon(buildMarkerIcon(redIcon));
    circles.get(String(node)).setStyle({fillColor: `#${red}`, fillOpacity: 0.1, weight: 1, color: '#000000', opacity: 0.2});
}

// Changes the marker and its circle color to blue.
function setColorBlue(node) {
    markers.get(String(node)).setIcon(buildMarkerIcon(blueIcon));
    circles.get(String(node)).setStyle({fillColor: `#${blue}`, fillOpacity: 0.2, color: '#000000', opacity: 0.5});
}

// Changes the marker and its circle color to green.
function setColorGreen(node) {
    markers.get(String(node)).setIcon(buildMarkerIcon(greenIcon));
    circles.get(String(node)).setStyle({fillColor: `#${green}`, fillOpacity: 0.3, weight: 2, color: '#000000', opacity: 1});
}

// Changes the icon color to yellow.
function setColorYellow(node) {
    markers.get(String(node)).setIcon(buildMarkerIcon(yellowIcon));
}

// onmouseover function for groups table go node cell
// eslint-disable-next-line no-unused-vars
// Change the color of the markers and their circles depending on their role.
function changeMarkerColor(node) {
    const membersnodes = groups.get(String(node));
    if (membersnodes != null) { // node is group owner and has members
        setColorGreen(node);
        for (i = 0; i < membersnodes.length; i++) {
            setColorYellow(membersnodes[i]);
        }
    } else {
        setColorBlue(node);
    }
}

// onmouseout function for groups table go node cell
// eslint-disable-next-line no-unused-vars
// Resets marker colors by changing them to red.
function resetMarkerColor(node) {
    const allmarkers = Array.from(markers.keys());
    if (!allmarkers.includes(`${node}`)) {
        return; // marker does not exist
    }
    const membersnodes = groups.get(String(node));
    setColorRed(String(node));
    if (membersnodes != null && membersnodes.length !== 0) {
        for (i = 0; i < membersnodes.length; i++) {
            setColorRed(membersnodes[i]);
        }
    }
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////// -- Nodes TABLE -- /////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

// Adds a new table entry when a new node is created
function addTableEntry(nodeId, latitude, longitude) {
    const table = document.getElementById('nodestable').getElementsByTagName('tbody')[0];

    const cell1 = `<td class='rowcell' style='vertical-align:middle; text-align:center' onmouseover="changeMarkerColor(${nodeId})" onmouseout="resetMarkerColor(${nodeId})" onclick="focusNode(${nodeId})">${nodeId}</td>`;
    const cell2 = `<td class="dropdown" style='vertical-align:middle; text-align:center'>
      <form>
          <select class="dropform" id="dropform${nodeId}" onchange="updateEmulatorBinds(this.id, ${nodeId})" onclick="savePreviousBind(${nodeId})">
              ${setEmulatorOptionsString(nodeId)}
          </select>
      </form>
    </td>`;
    const cell3 = `<td style='vertical-align:middle'> Lt(${latitude}), Lg(${longitude})</td>`;

    table.insertRow().innerHTML = cell1 + cell2 + cell3;
    updateAllAvailableEmuOptions(); // Updates bind options, Shows available emulators
}

// removes a table row corresponding to the removed node
function removeTableEntry(nodeId) {
    const table = document.getElementById('nodestable').getElementsByTagName('tbody')[0];
    const { length } = table.rows;
    try {
        for (let i = 0; i < length; i++) {
            const nodevalue = `${table.rows[i].cells[0].textContent}`;
            if (nodevalue === nodeId) {
                table.deleteRow(i);
            }
        }
    } catch (e) { console.log(e); } // CAREFULL THIS GIVES AN ERROR, does not cause problems for now
}

// Updates list of nodes (markers) on the right hand-side table.
function updateTable(id, latitude, longitude) { // updates location coordinates for node in table
    const table = document.getElementById('nodestable').getElementsByTagName('tbody')[0];
    const { length } = table.rows;

    try {
        for (let i = 0; i < length; i++) {
            const nodevalue = `${table.rows[i].cells[0].textContent}`;
            if (nodevalue === String(id)) {
                table.rows[i].cells[2].textContent = `Lt: (${latitude}), Lg: (${longitude})`;
            }
        }
    } catch (e) { console.log(e); }
}

// returns an array with the current table data, used to structure the json data and file for export
function getNodesTableData() {
    const tableData = [];
    const table = document.getElementById('nodestable').getElementsByTagName('tbody')[0];
    // iterate through rows
    // eslint-disable-next-line no-cond-assign
    for (let i = 0, row; row = table.rows[i]; i++) { // iterate through rows
        const rowData = [];
        cell1 = row.cells[0].textContent;
        const dropform = document.getElementById(`dropform${cell1}`);
        cell2 = dropform.options[dropform.selectedIndex].text;
        cell3 = row.cells[2].textContent;
        rowData.push(cell1);
        rowData.push(cell2);
        rowData.push(cell3);
        tableData.push(rowData);
    }
}

// eslint-disable-next-line no-unused-vars
// Centers the map on the input marker.
function focusNode(nodeId) {
    const marker = markers.get(String(nodeId));
    map.setView(marker.getLatLng(),18);
}

// Resets all tables (nodes and groups tables) and deletes their items.
function resetAllTabels() {
    const nodesTable = document.getElementById('nodestable').getElementsByTagName('tbody')[0];
    const groupsTable = document.getElementById('groupstable').getElementsByTagName('tbody')[0];
    nodesTable.innerHTML = '';
    groupsTable.innerHTML = '';
}
// /////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////// -- BINDING -- /////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line no-unused-vars
// This function updates emulator and a node (PC/marker) bind.
function updateEmulatorBinds(dropformNodeId, nodeId) {
    const selected = document.getElementById(`${dropformNodeId}`).value;

    if (selected === '-') {
        // reset bind
        removeBind(nodeId, previousBind); // removes an emulator and a PC bind from binds map
    } else if (previousBind === '-') {
        // New bind
        setBind(nodeId, selected);
    } else {
        // Unbind and newbind
        removeBind(nodeId, previousBind);
        setBind(nodeId, selected);
    }
}

// eslint-disable-next-line no-unused-vars
// Saves the previous the node bind to an emulator (marker/PC) in previousBind.
function savePreviousBind(nodeId) {
    const dropform = document.getElementById(`dropform${nodeId}`);
    previousBind = dropform.options[dropform.selectedIndex].text;
}

// eslint-disable-next-line no-unused-vars
// Shows available emulators (not used emulators).
function updateAllAvailableEmuOptions() {
    const usedEmulators = getUnavailableBinds();
    const allIds = getIdOfAllMarkers();

    allIds.forEach((nodeId) => {
        emulators.forEach((emu) => {
            if (usedEmulators.includes(emu)) {
                document.getElementById(`${emu}${nodeId}`).disabled = true;
            } else {
                document.getElementById(`${emu}${nodeId}`).disabled = false;
            }
        });
    });
}

// returns emulator options for each node in the UI's right side table in Bind section.
function setEmulatorOptionsString(nodeId) {

    let emuString = '<option id="-">-</option>'; // default

    // if it is the first marker update emulators list to show them on the dropdown menu in the nodes table
    if (flagEmulatorsView){
        refreshEmusBtn();
    }

    emulators.forEach((emu) => {
        emuString = `${emuString}<option id="${emu}${nodeId}">${emu}</option>`;
    });
    return emuString;
}

// Binds a node (marker/PC) and an emulator.
function setBind(nodeId, emulator) {
    binds.set(`${nodeId}`, emulator);
    updateAllAvailableEmuOptions();
    processOperation(['bind', nodeId, emulator]);
}

// This function deletes an emulator and a PC bind from binds map.
function removeBind(nodeId, emulator) {
    binds.delete(`${nodeId}`); // Removes an item from the binds Map
    updateAllAvailableEmuOptions();
    processOperation(['unbind', nodeId, emulator]);
}

/**
 * Returns an array with the emulators available for binding
 */
function getAvailableBinds() {
    const availableEmus = [];
    const emusBinded = getUnavailableBinds();
    emulators.forEach((emu) => {
        if (!emusBinded.includes(emu)) {
            availableEmus.push(emu);
        }
    });

    return availableEmus;
}

// Returns the unavailable emulators (used emulators) list for binding.
function getUnavailableBinds() {
    const unavailableEmus = Array.from(binds.values());
    return unavailableEmus;
}

/**
 * This function is responsible for rebuilding the binding options on each binds select
 * This is executed each time a user updated the emulatores options and there is changes!
 * Indeed this function update options list for each bind (marker to emulator bind).
 */
function rebuildBindsMenuOptions() {
    const allnodes = getIdOfAllMarkers();
    allnodes.forEach((nodeId) => {
        removeAllOptions(nodeId);
        redrawDropFormOptions(nodeId);
    });
}

/**
 * Clear the list of all select options form in the table for the passed nodeId (marker).
 * Indeed, deletes a marker's context menu.
 * @param {String} nodeId
 */
function removeAllOptions(nodeId) {
    const selectElement = document.getElementById(`dropform${nodeId}`);
    let i;
    const L = selectElement.options.length - 1;
    for (i = L; i >= 0; i--) {
        selectElement.remove(i);
    }
}

/**
 * Redraws the select options form in the table for the passed nodeId
 * (Adds options to a marker (adds context menu to a marker)).
 * @param {Html select element} selectElement
 * @param {String} nodeId
 */
function redrawDropFormOptions(nodeId) {
    const selectElement = document.getElementById(`dropform${nodeId}`);

    // set default
    const defaultOption = document.createElement('option');
    defaultOption.text = '-';
    defaultOption.setAttribute('id', '-');
    selectElement.add(defaultOption);

    // add rest
    emulators.forEach((emu) => {
        const option = document.createElement('option');
        option.text = `${emu}`;
        option.setAttribute('id', `${emu}${nodeId}`);
        selectElement.add(option);
    });
}

/**
 * Rebinds the nodes that had their available emulator bind not changed with the new emulators
 * @param {Array of String representing emulatores} oldbinds
 */
function rebindUnchanged(oldbinds) {
    oldbinds.forEach((value, key) => {
        if (emulators.includes(value)) {
            binds.set(`${key}`, value);
            document.getElementById(`dropform${key}`).value = value;
        }
    });
    updateAllAvailableEmuOptions();
}

/**
 * This function checks if the emulator passed has parameter is available for bind,
 * if so returns true, if not it returns the id of the node that is bind to it
 * (Returns true if the input emulator has a bind to a node).
 * @param {String} emu name
 */
function isBindAvailable(emu) {
    let result = true;
    binds.forEach((value, key) => {
        if (value === emu) {
            result = key;
        }
    });
    return result;
}

/**
 * This function checks if the emulator passed has argument exists or not.
 * (Returns true if the input emulator exists.)
 * If so returns true, false otherwise.
 * @param {String} emu name
 */
function doesEmuExist(emu) {
    return emulators.includes(emu);
}

/**
 * This function returns an array with all the nodes (nodes IDs) that are currently binded to an emulator
 */
function getBindedNodes() {
    return Array.from(binds.keys());
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////(////// -- Groups Table -- /////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

// Adds a new table entry when a new node is created
function addGroupTableRow(goNode, nodes) {
    const members = nodes.slice();
    const table = document.getElementById('groupstable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    members.unshift(goNode);
    newRow.id = `go${goNode}`;
    const cell1 = `<td class='rowcell' style='vertical-align:middle; text-align:center; width:30%' 
    onmouseover="changeMarkerColor(${goNode})" onmouseout="resetMarkerColor(${goNode})" onclick="focusNode(${goNode})">${goNode}</td>`;
    const cell2 = `<td style='vertical-align:middle; width:70%'>(${members})</td>`;

    newRow.innerHTML = cell1 + cell2;
}

// removes a table row corresponding to the removed group.
function removeGroupTableEntry(goNode) {
    const row = document.getElementById(`go${goNode}`);
    row.parentNode.removeChild(row);
}

/**
 * Function responsible for updating groups table when we add or remove a member to a group
 * action param specifies if join or leave operation
 * node what node is joining or leaving
 * goNode is the group to be updated
 */
function updateGroupsTable(goNode) {
    const table = document.getElementById('groupstable').getElementsByTagName('tbody')[0];
    const { length } = table.rows;

    try {
        for (let i = 0; i < length; i++) {
            const gname = `${table.rows[i].cells[0].textContent}`;
            if (gname === goNode) {
                const groupMembers = groups.get(goNode);
                const groupMembersAndGo = groupMembers.slice();
                groupMembersAndGo.unshift(goNode);
                table.rows[i].cells[1].textContent = `(${groupMembersAndGo})`;
            }
        }
    } catch (e) { console.log(e); }
}

// returns an array with the current table data, used to structure the json data and file for export
// Saves data of groups table in an array called tableData.
function getGroupsTableData() {
    const tableData = [];
    const table = document.getElementById('groupstable').getElementsByTagName('tbody')[0];
    // iterate through rows
    // eslint-disable-next-line no-cond-assign
    for (let i = 0, row; row = table.rows[i]; i++) { // iterate through rows
        const rowData = [];
        cell1 = row.cells[0].textContent;
        cell2 = row.cells[1].textContent;
        rowData.push(cell1);
        rowData.push(cell2);
        tableData.push(rowData);
    }
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////// -- Groups Operations -- ///////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * args = [nodeleader, node1, node2, ...]
 * This function creates a group,
 * also, adds the new group to the groups table (from marker contextmenu).
 * to achieve this a number of verifications must be done:
 * 1st check if all nodes received as parm exits
 * 2nd check if group already exists
 * 3rd check if any of the nodes received already in a group
 * 4th check if all nodes in range of GO node
 * Only then
 * Can the group be created and added to groups map
 * A new row within groups table created for the new group
 * Command is processed and registered
 */
function createGroup(goNode, members) {
    groups.set(goNode, members);
    addGroupTableRow(goNode, members);
    processOperation(['creategroup', goNode, `(${members})`]);
    showGroupsTable();
}

/**
 * args = [node, groupname]
 * This function joins a node to a group,
 * Adds a node to a group, updates group tables, and saves/calls the join operation.
 * to achieve this a number of verifications must be done:
 * 1st check if all nodes received as parm exits
 * 2nd check if node already in a group
 * 3rd check if group exists
 * 4th check if node in range of GO node
 * Only then
 * Can the node join the group by updating the groups map
 * The groups table is updated
 * Command is processed and registered
 */
function joinGroup(joiningnode, goNode) {
    groups.get(goNode).push(joiningnode);
    updateGroupsTable(goNode);
    processOperation(['joingroup', joiningnode, `(${goNode})`]);
}

/**
 * args = [node, groupname]
 * This function removes a node from a group and updates Groups table,
 * a number of verifications must be done:
 * 1st check if group exists
 * 2nd check if nodes exists
 * 3rd check case were goNode is leaving group, if so group is DELETED
 * 4th checks if node belongs in group
 * Only then
 * Can the node be removed from the group by updating the groups map
 * The groups table is updated
 * Command is processed and registered
 */
function leaveGroup(node, goNode) {
    const members = groups.get(goNode);
    for (i = 0; i < members.length; i++) {
        if (members[i] === node) {
            (groups.get(goNode)).splice(i, 1);
            break;
        }
    }
    updateGroupsTable(goNode);
    processOperation(['leavegroup', node, `(${goNode})`]);
}

/**
 * This function deletes the group passed has argument
 * @param {String} goNode
 */
function deleteGroup(goNode) {
    removeGroupTableEntry(goNode);
    groups.delete(goNode);
    processOperation(['deletegroup', goNode]);
}

/**
 * This function checks if all the nodes passed within the nodesArray exist or not,
 * If they all exist an empty array is returned, otherwise the array is return with the node that do not exist.
 * @param {Array of strings} nodesArray with all node ids to check
 */
function doAllNodesExist(nodesArray) {
    const allNodes = getAllNodes();
    const result = [];

    nodesArray.forEach((node) => {
        if (!(allNodes.includes(node))) {
            result.push(node);
        }
    });
    return result;
}

/**
 * This function checks if group already exists.
 * Returns true if yes and false if not.
 * @param {String} goNode
 */
function doesGroupExist(goNode) {
    return (getAllGoNodes().includes(goNode));
}

// Returns true if the input node (marker) is member of a group.
function hasGroup(node) {
    let result = false;
    groups.forEach((value, key) => {
        if (value.includes(node)) {
            result = true; // has group
        }
    });
    return result;
}

// Returns groups' IDs that the input node (marker) is member of them.
function getGroupsPartOf(node) {
    const groupsIn = [];
    groups.forEach((value, key) => {
        if (value.includes(node)) {
            groupsIn.push(key);
        }
    });
    return groupsIn;
}

/**
 * This function checks if all nodes passed in nodes are in range of goNode.
 * Returns an array with the nodes that are not in range.
 * @param {String} goNode
 * @param {Array[Strings]} nodes
 */
function areThisNodesInRange(goNode, nodes) {
    // eslint-disable-next-line prefer-const
    let result = [];
    nodes.forEach((node) => {
        if (!(inRange(goNode, node))) {
            result.push(node);
        }
    });
    return result;
}

// Returns an array including part of input nodes that are in the range of the input node.
// In short, Returns array of nodes in the range of the input node.
function filterNodesInRage(nodearg, nodes) {
    const inrange = [];
    nodes.forEach((node) => {
        if (inRange(nodearg, node)) {
            inrange.push(node);
        }
    });
    return inrange;
}

// Returns array of group owner (go) nodes that input node is not member of their groups.
function filterOwnGroups(nodearg, goNodes) {
    const notMember = [];
    goNodes.forEach((goNode) => {
        if (!groups.get(goNode).includes(nodearg) && nodearg !== goNode) {
            notMember.push(goNode);
        }
    });
    return notMember;
}

// Returns true if two input markers are in range of each other.
function inRange(goid, mid) { // returns true if in range, false otherwise
    const goposition = markers.get(goid).getLatLng();
    const mposition = markers.get(mid).getLatLng();

    const gopositionL = L.latLng(goposition.lat,goposition.lng);
    const mpositionL = L.latLng(mposition.lat, mposition.lng);

    const distance = gopositionL.distanceTo(mpositionL); // returns distance between two nodes (here goposition and mposition) in meters

    if (distance <= wifiDirectRange) {
        return true;
    }
    return false;
}

/**
 * This function checks if node belongs to group or not
 * Returns true if yes and false if not.
 * @param {String} node
 * @param {Sring} group, refers to the go node id
 */
function belongsToGroup(node, group) {
    return groups.get(group).includes(node);
}

// Returns true if the input node (marker) is a go node (group owner).
function isGoNode(node) {
    result = groups.get(node);
    if (result != null) {
        return true;
    }
    return false;
}

// Returns an array of all groups owners/go nodes.
function getAllGoNodes() {
    return Array.from(groups.keys());
}

// Returns all marker IDs.
function getAllNodes() {
    return Array.from(markers.keys());
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////// -- Buttons View -- ///////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line no-unused-vars
// Switches between nodes and groups tables.
function switchTables() {
    nodestable = document.getElementById('nodestable');
    groupstable = document.getElementById('groupstable');
    if (nodestable.style.display === 'none') {
        groupstable.style.display = 'none';
        nodestable.style.display = '';
    } else {
        nodestable.style.display = 'none';
        groupstable.style.display = '';
    }
}

// Shows the table of groups in the UI.
function showGroupsTable() {
    nodestable = document.getElementById('nodestable');
    groupstable = document.getElementById('groupstable');
    if (groupstable.style.display === 'none') {
        nodestable.style.display = 'none';
        groupstable.style.display = '';
    }
}

// eslint-disable-next-line no-unused-vars
// Adds the new command to the list of the commands that are done.
function setOperationDoneList() {
    showSaveOptions(); // to make save option available or not
    const commandsDoneList = document.getElementById('commandsdonelist');
    commandsDoneList.innerHTML = '';
    cmdsDone.forEach((operation) => {
        let setId = '';
        let operationString = JSON.stringify(operation);
        // trim undesired char from string
        operationString = operationString.replace('[', '').replace(']', '').replace(/"/g, '').replace(/,/g, ' ');
        if (operationString === 'commit') {
            setId = 'commitEntry';
        } else if (operationString === 'clear') {
            setId = 'clearEntry';
        } else if (operationString === 'start') {
            operationString = `<span class="glyphicon glyphicon-play">(${operationString})</span>`;
            setId = 'startEntry';
        } else if (operationString === 'pause') {
            operationString = `<span class="glyphicon glyphicon-pause">(${operationString})</span>`;
            setId = 'pauseEntry';
        } else if (operationString === 'stop') {
            operationString = `<span class="glyphicon glyphicon-stop">(${operationString})</span>`;
            setId = 'stopEntry';
        }
        const newListEntry = document.createElement('LI');
        if (setId !== '') {
            newListEntry.id = setId;
        }
        operationText = document.createTextNode(operationString);
        // newListEntry.appendChild(operationText);
        newListEntry.innerHTML = operationString;
        commandsDoneList.appendChild(newListEntry);
    });
    // showData();
    document.getElementById('commandsDoneModal').style.display = 'block';
}

// If list of commands that are done is not empty, enables the save operations button.
function showSaveOptions() {
    if (cmdsDone.length !== 0) {
        document.getElementById('saveOperations').disabled = false;
    } else {
        document.getElementById('saveOperations').disabled = true;
    }
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////// -- LOAD & SAVE OPERATIONS -- //////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////
/*
This is used to start the interface configuration based on a prexisting file.
With this a user can start a specific network configuration on load, usefull for a large network.
To achieve this we basically have to have one function to execute each operation available on the
interface. This are 'createnode', 'deletenode', 'deleteall', 'move', 'bind', 'unbind', 'creategroup'
and 'deletegroup'.
*/

// Returns true if the input array has duplicate value.
function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
}

// eslint-disable-next-line no-unused-vars
// Loads a file (network file) in the UI.
function loadNetwork() {
    const fileName = document.getElementById('uploadinput');
    const fileObj = fileName.files.item(0);
    placeFileContent(fileObj);
    document.getElementById('uploadinput').value = '';
}

// Moves the content of the input file to an array then calls a function to process the file content.
function placeFileContent(file) {
    readFileContent(file).then((content) => {
        const fileToArrayStrings = content.split('\n');
        processFileArray(fileToArrayStrings);
    }).catch((error) => console.log(error));
}

// Reads the content of the input file.
function readFileContent(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

// Changes the cursor style.
function changeCursor(type) {
    if (type === 'crosshair') {
        //console.log("changeCursor > Cursor type: crosshair");
        L.DomUtil.addClass(map._container, 'crosshair-cursor-enabled');
    } else { // default
        document.documentElement.style.cursor = type;
        L.DomUtil.removeClass(map._container,'crosshair-cursor-enabled');
    }
}

// Loads the input file (network) to the UI, process those commands and deletes the current topology if it exists.
async function processFileArray(fileArray) {
    if (markers.length !== 0) {
        if (!confirm('Are you sure you want to load the selected file? \nCurrent network will be erased!')) {
            document.getElementById('uploadinput').value = '';
            return;
        }
        deleteAllMarkers();
    }

    for (let i = 0; i < fileArray.length; i++) {
        const cmdString = fileArray[i];
        cmdStringTrimmed = cmdString.replace(' ()', '').replace('(', '').replace(')', '');
        const cmdArray = cmdStringTrimmed.split(' ');

        if (hasDuplicates(cmdArray)) { // check for duplicated arguments
            alert(`Operation ${cmdArray} contains duplicated values. Loading Stopped!`);
            return; // Right now we stop loading if duplication is found
        }
        // eslint-disable-next-line no-await-in-loop
        await processStringCommand(cmdArray);
    }
}

// Calls related functions based on the input array of the commands.
function processStringCommand(cmdArray) {
    return new Promise((resolve) => {
        setTimeout(() => {
            switch (cmdArray[0]) {
                case 'createnode':
                    // createnode: cmdArray['createnode', 'id', 'lat', 'lng']
                    if (cmdArray.length !== 4) { // check for number of arguments
                        alert(`Invalid number of arguments on operation: "${cmdArray}". Operation SKIPPED.`);
                    } else {
                        createMarker(cmdArray[1], cmdArray[2], cmdArray[3]);
                    }
                    break;

                case 'deletenode':
                    // deletenode: cmdArray['deletenode','id'];
                    if (cmdArray.length !== 2) { // check for number of arguments
                        alert(`Invalid number of arguments on operation: "${cmdArray}". Operation SKIPPED.`);
                    } else if (doesNodeExist(cmdArray[1])) { // if node does not exist
                        alert(`Node ${cmdArray[1]} does not exist. Operation: "${cmdArray}" SKIPPED.`);
                    } else {
                        deleteMarker(cmdArray[1]);
                    }
                    break;

                case 'move':
                    // move: cmdArray['move', 'nodeMoving', 'lat', 'lng']
                    if (cmdArray.length !== 4) { // check for number of arguments
                        alert(`Invalid number of arguments on operation: "${cmdArray}". Operation SKIPPED.`);
                    } else if (!doesNodeExist(cmdArray[1])) { // if node does not exist
                        alert(`Node ${cmdArray[1]} does not exist. Operation: "${cmdArray}" SKIPPED.`);
                    } else {
                        const currentCords = markers.get(cmdArray[1]).getLatLng();
                        moveMarker(cmdArray[1], cmdArray[2], cmdArray[3], currentCords);
                    }
                    break;

                case 'EventMove': // cmd, node id, destination lat, destination lng
                    if (cmdArray.length !== 4) { // check for number of arguments
                        alert(`Invalid number of arguments on operation: "${cmdArray}". Operation SKIPPED.`);
                    } else if (!doesNodeExist(cmdArray[1])) { // if node does not exist
                        alert(`Node ${cmdArray[1]} does not exist. Operation: "${cmdArray}" SKIPPED.`);
                    } else {
                        const destinationLatLng = [parseFloat(cmdArray[2]), parseFloat(cmdArray[3])];
                        createRoute(cmdArray[1], destinationLatLng);
                        cmdsDone.push(['EventMove', cmdArray[1], cmdArray[2], cmdArray[3]]);
                    }
                    break;

                /* case 'start':
                cmdsDone.push(['start']);
                moveStartClicked();
                break;

              case 'pause':
                if (!eventactive) {
                  alert(`No movement event active. Operation: "${cmdArray}" SKIPPED.`);
                } else {
                  moveStartClicked();
                  cmdsDone.push(['pause']);
                }
                break;

              case 'stop':
                cmdsDone.push(['stop']);
                moveStopClicked();
                break; */

                case 'creategroup':
                    // creategroup: cmdArray['creategroup', 'goNode', 'member1', 'member2', ...]
                    if (cmdArray.length < 2) { // check for number of arguments
                        alert(`Invalid number of arguments on operation: "${cmdArray}". Operation SKIPPED.`);
                    } else if ((result = doAllNodesExist(cmdArray.slice(1))).length !== 0) { // check if all nodes exist
                        alert(`Node/s ${result} do not exist. Operation: "${cmdArray}" SKIPPED.`);
                    } else if (doesGroupExist(cmdArray[1])) { // check if go node is already go node or not
                        alert(`Group with GO node ${cmdArray[1]} already exists. Operation: "${cmdArray}" SKIPPED.`);
                    } else if ((result = areThisNodesInRange(cmdArray[1], cmdArray.slice(2))).length !== 0) { // check if all members are in range of go node
                        alert(`Node/s ${result} not in range of GO node ${cmdArray[1]}. Operation: "${cmdArray}" SKIPPED.`);
                    } else {
                        createGroup(cmdArray[1], cmdArray.slice(2));
                    }
                    break;

                case 'joingroup':
                    // joingroup: cmdArray['joingroup', 'nodeJoining', 'goNode']
                    if (cmdArray.length !== 3) { // check for number of arguments
                        alert(`Invalid number of arguments on operation: "${cmdArray}". Operation SKIPPED.`);
                    } else if ((result = doAllNodesExist(cmdArray.slice(1))).length !== 0) { // check if all nodes exist
                        alert(`Node/s ${result} do not exist. Operation: "${cmdArray}" SKIPPED.`);
                    } else if (!doesGroupExist(cmdArray[2])) { // check if go node exist
                        alert(`Group with GO node ${cmdArray[2]} does not exists. Operation: "${cmdArray}" SKIPPED.`);
                    } else if (belongsToGroup(cmdArray[1], cmdArray[2])) { // check if node is in group already
                        alert(`Node ${cmdArray[1]} already in group ${cmdArray[2]}. Operation: "${cmdArray}" SKIPPED.`);
                    } else if (!inRange(cmdArray[2], cmdArray[1])) { // check if node in range
                        alert(`Node ${cmdArray[1]} not in range of group ${cmdArray[2]}. Operation: "${cmdArray}" SKIPPED.`);
                    } else {
                        joinGroup(cmdArray[1], cmdArray[2]);
                    }
                    break;

                case 'leavegroup':
                    // leavegroup: cmdArray['leavegroup', 'nodeLeaving', 'goNode']
                    if (cmdArray.length !== 3) { // check for number of arguments
                        alert(`Invalid number of arguments on operation: "${cmdArray}". Operation SKIPPED.`);
                    } else if ((result = doAllNodesExist(cmdArray.slice(1))).length !== 0) { // check if all nodes exist
                        alert(`Node/s ${result} do not exist. Operation: "${cmdArray}" SKIPPED.`);
                    } else if (!doesGroupExist(cmdArray[2])) { // check if go node exist
                        alert(`Group with GO node ${cmdArray[2]} does not exists. Operation: "${cmdArray}" SKIPPED.`);
                    } else if (!belongsToGroup(cmdArray[1], cmdArray[2])) { // check if node is in the group
                        alert(`Node ${cmdArray[1]} not in group ${cmdArray[2]}. Operation: "${cmdArray}" SKIPPED.`);
                    } else {
                        leaveGroup(cmdArray[1], cmdArray[2]);
                    }
                    break;

                case 'deletegroup':
                    // deletegroup: cmdArray['deletegroup', 'goNode']
                    if (cmdArray.length !== 2) { // check for number of arguments
                        alert(`Invalid number of arguments on operation: "${cmdArray}". Operation SKIPPED.`);
                    } else if (!doesGroupExist(cmdArray[1])) { // check if go node exist
                        alert(`Group with GO node ${cmdArray[1]} does not exists. Operation: "${cmdArray}" SKIPPED.`);
                    } else {
                        deleteGroup(cmdArray[1]);
                    }
                    break;

                case 'binddevice':
                    // binddevice: cmdArray['binddevice', 'nodeId', 'emulator']
                    if (cmdArray.length !== 3) { // check for number of arguments
                        alert(`Invalid number of arguments on operation: "${cmdArray}". Operation SKIPPED.`);
                    } else if (!doesNodeExist(cmdArray[1])) { // if node does not exist
                        alert(`Node ${cmdArray[1]} does not exist. Operation: "${cmdArray}" SKIPPED.`);
                    } else if (!doesEmuExist(cmdArray[2])) { // if emulator does not exist
                        alert(`Emu ${cmdArray[2]} does not exist. Operation: "${cmdArray}" SKIPPED.`);
                    } else if ((bindAvailable = isBindAvailable(cmdArray[2])) === false) { // if the emulator already binded
                        alert(`Emu ${cmdArray[2]} already binded to Node ${bindAvailable}. Operation: "${cmdArray}" SKIPED.`);
                    } else {
                        savePreviousBind(cmdArray[1]); // this is used to save what was previously selected, its importante in case we are changing an already binded emulator
                        document.getElementById(`dropform${cmdArray[1]}`).value = `${cmdArray[2]}`;
                        updateEmulatorBinds(`dropform${cmdArray[1]}`, cmdArray[1]); // binding is done here
                    }
                    break;

                case 'unbinddevice':
                    // unbinddevice: cmdArray['unbinddevice', 'nodeId']
                    if (cmdArray.length !== 2) { // check for number of arguments
                        alert(`Invalid number of arguments on operation: "${cmdArray}". Operation SKIPPED.`);
                    } else if (!doesNodeExist(cmdArray[1])) { // if node does not exist
                        alert(`Node ${cmdArray[1]} does not exist. Operation: "${cmdArray}" SKIPPED.`);
                    } else if (!(getBindedNodes().includes(cmdArray[1]))) { // if not is not binded
                        alert(`Node ${cmdArray[1]} is not binded. Operation: "${cmdArray}" SKIPPED.`);
                    } else {
                        savePreviousBind(cmdArray[1]); // this is used to save what was previously selected, its importante in case we are changing an already binded emulator
                        document.getElementById(`dropform${cmdArray[1]}`).value = '-';
                        updateEmulatorBinds(`dropform${cmdArray[1]}`, cmdArray[1]); // binding is done here
                    }
                    break;

                case 'clear':
                    // clear: cmdArray['clear']
                    deleteAllMarkers();
                    break;

                case 'commit':
                    // commit: cmdArray['commit']
                    if (cmdsDone.length <= 1) { // check if there is cmds to commit
                        alert(`Theres no operation to Commit. Operation: "${cmdArray}" SKIPPED.`);
                    } else {
                        commit();
                    }
                    break;

                case 'wait':
                    // wait: cmdArray['wait', 'time']
                    const waitTime = Math.round(cmdArray[1]);
                    if (waitTime <= 0) {
                        alert(`Wait with time ${waitTime} not valid. Operation: "${cmdArray}" SKIPPED.`);
                    } else {
                        cmdsDone.push(['wait', waitTime, 'ms']);
                        cmdsToCommitPushWait(waitTime);
                    }
                    break;

                case 'time':
                    // time: cmdArray['time', 'set/log']
                    if (cmdArray[1] === 'set' || cmdArray[1] === 'log') {
                        cmdsToCommit.push(`time ${cmdArray[1]}`);
                    }
                    break;

                default:
                    break;
            }

            resolve(true);
        }, 200);
    });
}

// This function sets and updates the waiting time in the wait command.
function cmdsToCommitPushWait(time) {
    const lastCommitCmd = cmdsToCommit[(cmdsToCommit.length) - 1]; // last committed command
    if (lastCommitCmd != null && lastCommitCmd.includes('wait')) {
        const waitArray = lastCommitCmd.split(' ');
        const currentT = parseInt(waitArray[1], 10);
        const newTime = currentT + time;
        cmdsToCommit.pop();
        cmdsToCommit.push(`wait ${newTime} ms`);
    } else {
        cmdsToCommit.push(`wait ${time} ms`);
    }
}

// eslint-disable-next-line no-unused-vars
// Saves commands and topology in the related files that users determine.
function save(type) {
    if (type === 'network') {
        if (markers.size === 0) {
            alert('The network is empty.');
            return;
        }
        const filename = askFileName(type);
        if (filename == null) { return; }
        const fileContent = buildSaveNetworkString();
        downloadTxtFile(filename, fileContent);
    } else if (type === 'operations') {
        const filename = askFileName(type);
        if (filename == null) { return; }
        const fileContent = formatCmdsDoneToDownload();
        downloadTxtFile(filename, fileContent);
    }
}

// Returns file name (whether default value or user entered value).
function askFileName(def) {
    let filename = prompt('File name:', '');
    if (filename === '') {
        filename = def;
    }
    return filename;
}

// Returns an array of commands including createnode, binddevice, creategroup, and EventMove.
function buildSaveNetworkString() {
    let cmdsString = '';
    markers.forEach((value, key) => { // createnode cmds
        const latlng = value.getLatLng();
        cmdsString += `createnode ${key} ${latlng.lat} ${latlng.lng}\n`;
    });
    binds.forEach((value, key) => { // binddevice cmds
        cmdsString += `binddevice ${key} ${value}\n`;
    });
    groups.forEach((value, key) => { // creategroups cmds
        cmdsString += `creategroup ${key} (${value})\n`;
    });
    movementPaths.forEach((value, key) => { // eventpaths
        const destination = value[(value.length) - 1];
        //cmdsString += `EventMove ${key} ${destination.lat} ${destination.lng}\n`;
        cmdsString += `EventMove ${key} ${destination[0]} ${destination[1]}\n`;
    });
    const resultString = cmdsString.substring(0, cmdsString.length - 1); // to remove the last \n
    return resultString;
}

// Reads cmdsDone (array of commands) and returns it as a string.
function formatCmdsDoneToDownload() {
    let resultString = '';
    let startOn = false; // this is done in order to save any command done after start
    const numCmds = cmdsDone.length;
    for (let i = 0; i < numCmds; i++) {
        // ----------------------------------- This is done to omit any operation withing start and stop of movement event
        if ((cmdsDone[i])[0] === 'start') {
            startOn = true;
            continue;
        } else if ((cmdsDone[i])[0] === 'stop') {
            startOn = false;
            continue;
        }
        if (startOn === false) { // ------------------------------------------------
            let operationString = JSON.stringify(cmdsDone[i]);
            // trim undesired char from string
            operationString = operationString.replace('[', '').replace(']', '').replace(/"/g, '').replace(/,/g, ' ');
            resultString = `${resultString + operationString}`;
            if (i !== numCmds - 1) {
                resultString = `${resultString}\n`;
            }
        }
    }
    return resultString;
}

// Prepares the input content for download with input name.
function downloadTxtFile(name, content) {
    const temporay = document.createElement('a');
    temporay.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
    temporay.setAttribute('download', name);
    temporay.style.display = 'none';
    document.body.appendChild(temporay);
    temporay.click();
    document.body.removeChild(temporay);
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////// -- Emulators View -- ////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line no-unused-vars
// If auto emulator refresh is on, calls refresh emulator button function to refresh the emulators.
function openEmulatorsView() {
    document.getElementById("emulatorsDataModal").style.display = 'block';

    if (autoEmuRefresh) {
        refreshEmusBtn();
    }
}

// eslint-disable-next-line no-unused-vars
// Asks Termite server for list of emulators and call the refreshEmulators function to refresh the emulators list.
function refreshEmusBtn() {
    const emulatorsDataArray = sendPostRequest('refresh'); // emulatorsDataArray -> response text

    // else part is added to check if the returned emulators list is empty or not (27 Dec 2022)
    if (emulatorsDataArray != null) {

        refreshEmulators(emulatorsDataArray.split(','));

    }
    // else{
    //
    //     flagEmulatorsView = false;
    //
    //     if (emulatorsDataArray == null){
    //         alert('Returned emulator array for the refresh request is empty');
    //     }
    // }
}

// Used to set emulators data on data view accessed through emulators button
// (holds start and stop emulator buttons).
function setEmulatorsDataView() {
    // Actual function body
    const emulatorsDataList = document.getElementById('emulatorsData');
    emulatorsDataList.innerHTML = ''; // clear old data

    emulatorsData.forEach((value, key) => { // (Key) Pc_Ip -> (Value) Emulators_data [["e1", "emu_name", "port", "cport", "mport"],[...],...]
        // create sub list to store all emulatores and their data that belongs to one network
        const networkList = document.createElement('LI');
        networkList.id = key;
        networkList.classList.add('emusOnNetworklist');

        // create title div that also houses the start emulator button
        // create title div element
        const networkListTitleDiv = document.createElement('DIV');
        networkListTitleDiv.classList.add('networkListTitle');
        networkListTitleDiv.innerHTML = `Termite2Server - ${key}`;
        // create button element
        const startEmuBtn = document.createElement('BUTTON');
        startEmuBtn.innerHTML = 'Start emulator';
        startEmuBtn.classList.add('startEmulatorBtn');
        startEmuBtn.onclick = function () { startEmulator(key); };
        // $(startEmuBtn).attr('data-dismiss', 'modal');

        networkListTitleDiv.appendChild(startEmuBtn);
        networkList.appendChild(networkListTitleDiv);

        value.forEach((emulatorData) => {
            // creates sub list for each emulator data
            const subEmuList = document.createElement('DL');
            subEmuList.id = emulatorData[0];
            subEmuList.classList.add('emuslist');

            // creates emulator data title that also holds the stop emulator button
            const emuData = document.createElement('DIV');
            emuData.classList.add('emuData');
            emuData.innerHTML = `<b class="emuDataTitle";>- ${emulatorData[0]}</b>`;

            subEmuList.appendChild(emuData);

            for (let i = 1; i < emulatorData.length; i++) {
                const data = document.createElement('DD');
                switch (i) {
                    case 1: // emu_name
                        data.appendChild(document.createTextNode(` Name : ${emulatorData[i]}`));
                        break;
                    case 2: // emu_port
                        data.appendChild(document.createTextNode(` Port : ${emulatorData[i]}`));
                        break;
                    case 3: // emu_commit_port
                        data.appendChild(document.createTextNode(` CommitP : ${emulatorData[i]}`));
                        break;
                    case 4: // emu_message_port
                        data.appendChild(document.createTextNode(` MessageP : ${emulatorData[i]}`));
                        break;
                    default:
                        break;
                }
                emuData.appendChild(data);
            }
            networkList.appendChild(subEmuList);
        });
        emulatorsDataList.appendChild(networkList);
    });

    setStopEmuOptions();
}

// Sets the "Stop emulator" and default options in the Emulators Data page.
function setStopEmuOptions() {
    const stopOptions = document.getElementById('stopEmuOptions');

    while (stopOptions.options.length > 0) { // remove previous options
        stopOptions.remove(0);
    }

    // add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.text = 'all';
    stopOptions.add(defaultOption);

    // add new options
    emulators.forEach((emuId) => {
        const stopOption = document.createElement('option');
        stopOption.value = emuId;
        stopOption.text = emuId;
        stopOptions.add(stopOption);
    });

    stopOptions.value = 'all';
}

// Starts one or more emulators.
// Note that if app is not chosen the function will be terminated, consider correct it.
function startEmulator(network) {
    let numEmus = null;
    let appPackage = null;

    do {
        const choice = window.prompt('How many emulators do you wish to start? (from 1 to 15)', '');
        if (choice === null) return; // user clicked "cancel"
        numEmus = parseInt(choice, 10);
    } while (isNaN(numEmus) || numEmus > 15 || numEmus < 1);

    do {
        appPackage = window.prompt('Do you wish to auto start an application?\nIf so type the application package.\nNOTE: No special charaters allowed except "." .', '');
        if (appPackage === null) return; // user clicked "cancel", Not always!
    } while (appPackage.length < 0 || (/\s/g.test(appPackage)) || (/[~`!#$%\^&*+=\\[\]\-\';,/{}|\\":<>\?]/g.test(appPackage)));

    if (appPackage == null) {
        appPackage = '';
    }

    const commandMsg = `startemus ${network} ${numEmus} ${appPackage}`;

    const result = sendPostRequest(commandMsg);
    if (result != null) {
        refreshEmulators(result.split(','));
    }
}

// eslint-disable-next-line no-unused-vars
//This function stops all emulators or one determined emulator by sending an HTTP request to Termite server.
function stopEmulator() {
    let commandMsg = '';
    const stopEmu = document.getElementById('stopEmuOptions').value;

    if (!confirm(`Are you sure you want to proceeded with stop emulator ${stopEmu}.\n 
      This will delete current emulator bind if it exists.`)) {
        return;
    }

    if (stopEmu === 'all') {
        commandMsg = 'stopall';
    } else {
        commandMsg = `stopemu ${stopEmu}`;
    }

    const result = sendPostRequest(commandMsg);
    if (result != null) {
        refreshEmulators(result.split(','));
    }
}

// eslint-disable-next-line no-unused-vars
// This function call sendPostRequest function to send a request for installed emulators.
function getInstalled() {
    const commandMsg = 'installed';
    const result = sendPostRequest(commandMsg);
    if (result != null) {
        alert(result);
    }
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////// -- HTTP Operations -- /////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

// This function sends an HTTP post request to the Termite2 server.
// Input = command, Output: response text
function sendPostRequest(msg) {
    const xhttp = new XMLHttpRequest();
    xhttp.open('POST', 'CommunicationServlet', false);
    xhttp.send(msg);

    const response = xhttp.responseText;

    if (response == null || response.includes('Status 500') || response.size === 0) { // I cant catch the 404 error message so i read it insted
        alert('Unable to contact Termite Client.');
        return null;
    }
    if (response.includes('Error')) {
        alert(response);
        return null;
    }

    // This one catches 404 error (successful - tested)
    // The HTTP 404 Not Found response status code indicates that the server cannot find the requested resource.
    if (response.includes('404')){
        alert(response);
        return null;
    }

    return response;
}

function commit() {
    const btncommit = document.getElementById('commitbutton');
    btncommit.innerHTML = 'Committing...';
    btncommit.style.background = '#008000';
    btncommit.style.color = '#ffffff';

    setTimeout(() => { processCommit(); }, 500);
}

function processCommit() {
    const btncommit = document.getElementById('commitbutton');
    const cmdsString = formatCommit();
    response = sendPostRequest(cmdsString);
    btncommit.innerHTML = 'Commit';
    if (response == null || response.length === 0) {
        // do nothing, alert was thrown already
    } else if (response.includes('FAIL')) { // response received but there were fails
        processOperation(['commit']);
        clearCommitArray();
        response = response.replace(/,/g, '\n');
        alert(`${response}`);
    } else { // response received and no FAILS.
        processOperation(['commit']);
        clearCommitArray();
        response = response.replace(/,/g, '\n');
        alert(`${response}`);
        btncommit.style.background = '#ffffff';
        btncommit.style.color = '#000000';
        document.getElementById('commitbutton').disabled = true;
    }
}

function formatCommit() {
    let commitString = '';
    const { length } = cmdsToCommit;
    for (i = 0; i < length; i++) {
        commitString += `${cmdsToCommit[i]};`;
    }
    if (commitString.includes('move') || commitString.includes('creategroup')
        || commitString.includes('deletegroup') || commitString.includes('joingroup')
        || commitString.includes('leavegroup')) {
        return `${commitString}commit`; // in case there is network changes relevant to the emulators, the commit command to be sent and processed on termite-cli
    }
    return commitString.slice(0, -1); // there is no relevant command to be committed for the emulators. we remove the last ; to avoid errors
}

function start(){
    setUrlPath();
    setOpenRoutServiceApiKey();

    // first start connect msg to termite-cli
    const xHttp = new XMLHttpRequest();
    xHttp.open('GET', 'CommunicationServlet', false); // false for synchronous request
    xHttp.send(null);
    const response = xHttp.responseText;
    const { length } = response;

    if (response.charAt(0) === '<') { // I cant catch the 404 error message so i read it insted
        alert('Unable to contact Termite Client.');
        return;
    }

    // this is used to verify error connection with termite cli
    if (response === 'ERROR') {
        alert('Unable to contact Termite Client.');
        return;
    }
}

// This function refreshes emulators list. Also, turn on/off the StopEmuBtn.
// Input -> arrays of string
function refreshEmulators(emulatorsDataArray) {

    if ((JSON.stringify(emulatorsDataArray) === previousEmusData) && markers.size < 1) {
        return;
    }

    // save data received
    previousEmusData = JSON.stringify(emulatorsDataArray);

    let newEmulatorIds = setEmulatorsDataObjects(emulatorsDataArray);
    if (flagEmulatorsView){
        emulators = newEmulatorIds;
        flagEmulatorsView = false;

        return;
    }else {
        refreshBinds(newEmulatorIds);
        setEmulatorsDataView();
        setStopEmuOptions();
        alert('Available emulators updated!');

        if (emulators.length === 0) {
            document.getElementById('stopEmuBtn').disabled = true;
        } else {
            document.getElementById('stopEmuBtn').disabled = false;
        }
    }

}

// This function saves PCs' IPs and their emulators, and return array of PCs' IPs.
// Input -> array of strings (emulators data), Output -> emulators ID? or pc IPs
function setEmulatorsDataObjects(dataArray) {
    // reset data objects that store emulators data
    emulatorsData = new Map(); // pcIp => emulators data string
    let newEmulatorIds = []; // holds PCs' IP
    let pcIp = '';
    for (i = 0; i < dataArray.length; i++) {
        const splitted = dataArray[i].split(';');

        if (splitted.length === 1) { // pc ip
            pcIp = splitted[0];
            emulatorsData.set(pcIp, []);
        } else { // emulator data
            const tempArray = emulatorsData.get(pcIp);

            newEmulatorIds.push(splitted[0]);
            tempArray.push(splitted); // pcIp is also added to tempArray.

            emulatorsData.set(pcIp, tempArray);
        }
    }
    return newEmulatorIds;
}

// Updates emulators and markers (nodes) binds after updating emulators list.
function refreshBinds(newEmulators) {
    const oldBinds = binds;
    binds = new Map(); // resets binds

    if (oldBinds.size != 0){
        oldBinds.forEach((value, key) => {
            if (!newEmulators.includes(value)) {
                removeBind(key, value);
            }
        });
    }

    emulators = newEmulators;

    if (flagEmulatorsView){
        rebuildBindsMenuOptions(binds);
        flagEmulatorsView = false;
        rebindUnchanged(oldBinds);
    }else {
        rebuildBindsMenuOptions(oldBinds);
        rebindUnchanged(oldBinds);
    }
}

/*
 * IMPORTANT!
 * This is used to tell the Apache server that the page was closed or refreshed in order to then
 * warn Termite client that the network should be cleared.
 * */
// eslint-disable-next-line func-names
window.onunload = function () {
    navigator.sendBeacon('CommunicationServlet', 'clear');
};

function clearCommitArray() {
    cmdsToCommit = [];
}
// /////////////////////////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////// -- DATA -- ///////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

function processOperation(command) {
    document.getElementById('commitbutton').disabled = false;
    switch (command[0]) {
        case 'createnode':
            cmdsDone.push(['createnode', command[1], command[2], command[3]]);
            cmdsToCommit.push(`newdevice ${command[1]}`); // cmd, device/node
            if (command[4] !== '()') {
                cmdsToCommit.push(`move ${command[1]} ${command[4]}`);
            }
            break;

        case 'deletenode':
            cmdsDone.push(['deletenode', command[1]]);
            cmdsToCommit.push(`deletedevice ${command[1]}`); // cmd, device/node
            break;

        case 'deleteall':
            cmdsDone.push(['clear']);
            cmdsToCommit.push('clear'); // cmd
            break;

        case 'bind':
            cmdsDone.push(['binddevice', command[1], command[2]]);
            cmdsToCommit.push(`binddevice ${command[1]} ${command[2]}`); // cmd, device/node, emulator id
            break;

        case 'unbind':
            cmdsDone.push(['unbinddevice', command[1]]);
            cmdsToCommit.push(`unbinddevice ${command[1]}`); // cmd, device/node
            break;

        case 'move':
            cmdsDone.push(['move', command[1], command[2], command[3]]);
            cmdsToCommit.push(`move ${command[1]} ${command[4]}`);
            break;

        case 'EventMove': // cmd, node id, destination coordinates
            cmdsDone.push(['EventMove', command[1], command[2], command[3]]);
            break;

        case 'start':
            cmdsDone.push(['start']);
            break;

        case 'pause':
            cmdsDone.push(['pause']);
            break;

        case 'stop':
            cmdsDone.push(['stop']);
            break;

        case 'creategroup':
            cmdsDone.push(['creategroup', command[1], command[2]]);
            // cmdsToCommit.push(`move ${command[1]} ${command[2]}`); // This is logged to prevent an error case
            cmdsToCommit.push(`creategroup ${command[1]} ${command[2]}`); // cmd, goNode, member/s
            break;

        case 'joingroup':
            cmdsDone.push(['joingroup', command[1], command[2]]);
            // cmdsToCommit.push(`move ${command[1]} ${command[2]}`); // This is logged to prevent an error case
            cmdsToCommit.push(`joingroup ${command[1]} ${command[2]}`); // cmd, node, goNode
            break;

        case 'leavegroup':
            cmdsDone.push(['leavegroup', command[1], command[2]]);
            cmdsToCommit.push(`leavegroup ${command[1]} ${command[2]}`); // cmd, node, goNode
            break;

        case 'deletegroup':
            cmdsDone.push(['deletegroup', command[1]]);
            cmdsToCommit.push(`deletegroup ${command[1]}`); // cmd, goNode
            break;

        case 'commit':
            cmdsDone.push(['commit']);
            cmdsToCommit.push('commit'); // cmd, goNode
            break;

        case 'wait':
            // wait: command['wait', 'time']
            const waitTime = Math.round(command[1]);
            cmdsDone.push(['wait', waitTime, 'ms']);
            cmdsToCommitPushWait(waitTime);
            break;

        default:
            break;
    }
}

// eslint-disable-next-line no-unused-vars
function showData() {
    console.log('\n\n');
    showAllMarkers();
    showAllCircles();
    showEmulators();
    showBinds();
    getNodesTableData();
    showGroups();
    getGroupsTableData();
    console.log(cmdsDone);
    console.log(cmdsToCommit);
    showEmualtorsDataObjects();
    showApplications();
    console.log('\n\n');
}

function showGroups() {
    console.log('showGroups(): \n');
    console.log(groups);
}

function showBinds() {
    console.log('showBinds(): \n');
    console.log(binds);
}

function showEmulators() {
    console.log('showEmulators(): \n');
    console.log(emulators);
    console.log(`Unavailable: ${getUnavailableBinds()}`);
}

function showAllMarkers() {
    console.log('showAllMarkers(): \n');
    console.log(markers);
}

function showAllCircles() {
    console.log('showAllCircles(): \n');
    console.log(circles);
}

function showEmualtorsDataObjects() {
    console.log('showEmualtorsDataObjects(): \n');
    console.log('emulatorsData map:');
    console.log(emulatorsData);
    console.log(`emulators ids array: ${emulators}`);
}

// /////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////// -- Buttons -- //////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////

// Shows the help modal. I added.
function helpBtn(){
    document.getElementById('informationModal').style.display = 'block';
}

// Closes the help modal. I added.
function closeInformationModal(){
    document.getElementById('informationModal').style.display = 'none';
}

function closeEmulatorDataModal(){
    document.getElementById('emulatorsDataModal').style.display = 'none';
}

function closeCommandsDoneModal(){
    document.getElementById('commandsDoneModal').style.display = 'none';
}