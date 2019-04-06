// The Google Map.
var map;

// The HTML element that contains the drop container.
var dropContainer;
var panel;
var geoJsonInput;
var downloadLink;

function init() {
    // 百度地图API功能
    map = new BMap.Map("map-holder");    // 创建Map实例
    map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);  // 初始化地图,设置中心点坐标和地图级别
    //添加地图类型控件
    map.addControl(new BMap.MapTypeControl({
        mapTypes:[
            BMAP_NORMAL_MAP,
            BMAP_HYBRID_MAP
        ]}));     
    map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的
    map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放


    bindDataLayerListeners();

    // Retrieve HTML elements.
    dropContainer = document.getElementById('drop-container');
    panel = document.getElementById('panel');
    var mapContainer = document.getElementById('map-holder');
    geoJsonInput = document.getElementById('geojson-input');
    downloadLink = document.getElementById('download-link');

    // Resize the geoJsonInput textarea.
    resizeGeoJsonInput();

    // Set up the drag and drop events.
    // First on common events.
    [mapContainer, dropContainer].forEach(function(container) {
        addDomListener(container, 'drop', handleDrop);
        addDomListener(container, 'dragover', showPanel);
    });

    // Then map-specific events.
    addDomListener(mapContainer, 'dragstart', showPanel);
    addDomListener(mapContainer, 'dragenter', showPanel);

    // Then the overlay specific events (since it only appears once drag starts).
    addDomListener(dropContainer, 'dragend', hidePanel);
    addDomListener(dropContainer, 'dragleave', hidePanel);
    // Set up events for changing the geoJson input.
    addDomListener(
        geoJsonInput,
        'input',
        refreshDataFromGeoJson);
    addDomListener(
        geoJsonInput,
        'input',
        refreshDownloadLinkFromGeoJson);

    // Set up events for styling.
    addDomListener(window, 'resize', resizeGeoJsonInput);

    addDrawingTool(map);
}
function addDomListener(element, type, callback){
    element.addEventListener(type, callback)
}
addDomListener(window, 'load', init);

function addDrawingTool(map){
    var overlays = [];
    var overlaycomplete = function(e){
        overlays.push(e.overlay);
    };
    var styleOptions = {
        strokeColor:"red",    //边线颜色。
        fillColor:"red",      //填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 3,       //边线的宽度，以像素为单位。
        strokeOpacity: 0.8,    //边线透明度，取值范围0 - 1。
        fillOpacity: 0.6,      //填充的透明度，取值范围0 - 1。
        strokeStyle: 'solid' //边线的样式，solid或dashed。
    }
    //实例化鼠标绘制工具
    var drawingManager = new BMapLib.DrawingManager(map, {
        isOpen: false, //是否开启绘制模式
        enableDrawingTool: true, //是否显示工具栏
        drawingToolOptions: {
            anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
            offset: new BMap.Size(5, 5), //偏离值
        },
        circleOptions: styleOptions, //圆的样式
        polylineOptions: styleOptions, //线的样式
        polygonOptions: styleOptions, //多边形的样式
        rectangleOptions: styleOptions //矩形的样式
    });  
     //添加鼠标绘制工具监听事件，用于获取绘制结果
    drawingManager.addEventListener('overlaycomplete', overlaycomplete);

}
// Refresh different components from other components.
function refreshGeoJsonFromData() {
    map.data.toGeoJson(function(geoJson) {
        geoJsonInput.value = JSON.stringify(geoJson, null, 2);
        refreshDownloadLinkFromGeoJson();
    });
}

// Replace the data layer with a new one based on the inputted geoJson.
function refreshDataFromGeoJson() {
    var newData = new google.maps.Data({
        map: map,
        style: map.data.getStyle(),
        controls: ['Point', 'LineString', 'Polygon']
    });
    try {
        var userObject = JSON.parse(geoJsonInput.value);
        var newFeatures = newData.addGeoJson(userObject);
    } catch (error) {
        newData.setMap(null);
        if (geoJsonInput.value !== "") {
            setGeoJsonValidity(false);
        } else {
            setGeoJsonValidity(true);
        }
        return;
    }
    // No error means GeoJSON was valid!
    map.data.setMap(null);
    map.data = newData;
    bindDataLayerListeners(newData);
    setGeoJsonValidity(true);



    
}

// Refresh download link.
function refreshDownloadLinkFromGeoJson() {
    downloadLink.href = "data:;base64," + btoa(geoJsonInput.value);
}

// Apply listeners to refresh the GeoJson display on a given data layer.
function bindDataLayerListeners(dataLayer) {
    // dataLayer.addListener('addfeature', refreshGeoJsonFromData);
    // dataLayer.addListener('removefeature', refreshGeoJsonFromData);
    // dataLayer.addListener('setgeometry', refreshGeoJsonFromData);
}

// Display the validity of geoJson.
function setGeoJsonValidity(newVal) {
    if (!newVal) {
        geoJsonInput.className = 'invalid';
    } else {
        geoJsonInput.className = '';
    }
}

// Control the drag and drop panel. Adapted from this code sample:
// https://developers.google.com/maps/documentation/javascript/examples/layer-data-dragndrop
function showPanel(e) {
    e.stopPropagation();
    e.preventDefault();
    dropContainer.className = 'visible';
    return false;
}

function hidePanel() {
    dropContainer.className = '';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    hidePanel();

    var files = e.dataTransfer.files;
    if (files.length) {
        // process file(s) being dropped
        // grab the file data from each file
        for (var i = 0, file; file = files[i]; i++) {
            var reader = new FileReader();
            reader.onload = function(e) {
                map.data.addGeoJson(JSON.parse(e.target.result));
            };
            reader.onerror = function(e) {
                console.error('reading failed');
            };
            reader.readAsText(file);
        }
    } else {
        // process non-file (e.g. text or html) content being dropped
        // grab the plain text version of the data
        var plainText = e.dataTransfer.getData('text/plain');
        if (plainText) {
            map.data.addGeoJson(JSON.parse(plainText));
        }
    }
    // prevent drag event from bubbling further
    return false;
}

// Styling related functions
function resizeGeoJsonInput() {
    var geoJsonInputRect = geoJsonInput.getBoundingClientRect();
    var panelRect = panel.getBoundingClientRect();
    geoJsonInput.style.height = panelRect.bottom - geoJsonInputRect.top - 8 + "px";
}

// Custom JS by tomscholz

var mapResized = false;

// Toggle the visibility of the left panel
function toggle_visibility(id) {
    var displayState = document.getElementById(id);
    if (displayState.style.display == 'block') {
        displayState.style.display = 'none';
    } else {
        displayState.style.display = 'block';
    }
}

// Change width of the map when panel toggels
function changeWidth(id) {
    var width = document.getElementById(id);
    if (width.style.width == '64.9%') {
        width.style.width = '100%';
    } else {
        width.style.width = '64.9%';
    }
}

// Resize the map
function resizeMap(map) {
    google.maps.event.trigger(map, 'resize');
    mapResized = true;
}

// Call all functions at once
function panelToggle() {
    toggle_visibility('panel');
    changeWidth('map-container');
    resizeMap(map);
}

// Alert on unload
window.onbeforeunload = function() {
    return 'Are you sure you want to leave?';
};
