var GeoLoader = function(map, option){
    if (!map) {
        return;
    }
    map.geoloader = this;

    option = option || {};

    this._initialize(map, option);
};

// Baidu.lang.inherits(GeoLoader, Baidu.lang.Class, "GeoLoader");
GeoLoader.prototype._initialize = function(map, option) {
    /**
     * map对象
     * @private
     * @type {Map}
     */
    this._map = map;

    /**
     * 配置对象
     * @private
     * @type {Object}
     */
    this._option = option;

    /**
     *
     * @private
     * @type {Object}
     */
    this._overlays = [];

};
/**
 * linestring
 * @private
 * @type {object}
 */
GeoLoader.prototype._parserLineString = function(coordinates){
    if (!coordinates || coordinates.length <= 1 || !coordinates[0] || coordinates[0].length != 2) {
        return false;
    }
    var points = [];
    for (var i = 0; i < coordinates.length; i++) {
        // points.push(new BMap.Point(coordinates[i][0], coordinates[i][1]));
        points.push(new BMap.Point(coordinates[i][0], coordinates[i][1]));
    }
    return {
        coordinates : points,
        type : 'Polyline'
    };
};

/**
 * Polygon
 * @private
 * @type {object}
 */
GeoLoader.prototype._parserPolygon = function(coordinates){
    if (!coordinates || coordinates.length === 0 || !coordinates[0][0] || coordinates[0][0].length != 2) {
        return false;
    }
    var points = [];
    for (var i = 0; i < coordinates.length; i++) {
        for (var j = 0; j < coordinates[i].length; j++) {
            points.push(new BMap.Point(coordinates[i][j][0], coordinates[i][j][1]));
        }
        // points.push(new BMap.Point(coordinates[i][0], coordinates[i][1]));
    }
    return {
        coordinates : points,
        type : 'Polygon'
    };
};
/**
 * point
 * @privite
 * @type {object}
 */
GeoLoader.prototype._parserPoint = function(coordinates){
    if (!coordinates || coordinates.length === 0 || coordinates.length != 2) {
        return false;
    }
    var point = new BMap.Point(coordinates[0], coordinates[1]);
    return {
        coordinates : point,
        type : 'Marker'
    };
}
/**
 * linestring
 * @private
 * @type {object}
 */
GeoLoader.prototype._assemblerLineString = function(overlay){
    var points = overlay.getPath();
    var pts = [];
    for (var i = 0; i < points.length; i++) {
        pts[i] = [points[i].lng, points[i].lat];
    }
    return {
        coordinates : pts,
        type : 'LineString'
    };
};

/**
 * Polygon
 * @private
 * @type {object}
 */
GeoLoader.prototype._assemblerPolygon = function(overlay){
    var points = overlay.getPath();
    console.log(points);
    var polygon = [];
    var pts = [];
    for (var i = 0; i < points.length; i++) {
        pts[i] = [points[i].lng, points[i].lat];
    }
    polygon.push(pts);
    return {
        coordinates : polygon,
        type : 'Polygon'
    };
};
/**
 * point
 * @private
 * @type {object}
 */
GeoLoader.prototype._assemblerPoint = function(overlay){
    var point = overlay.getPosition();
    var pt = [point.lng, point.lat];
    return {
        coordinates : pt,
        type : 'Point'
    }
}