//	location information for the station location(see email)
var stationLocation = [[116.3937667872, 39.9860711115], 
				[116.4113647614, 39.8814267903], 
				[116.3634704697, 39.9319472813],
				[116.3681709994, 39.8797703107],
				[116.2499073668, 40.2089012175],
				[116.6351760260, 40.3272619492]];
var map = new BMap.Map("mapDisplay");
//	calculated center, mean of the stations' location
var point = new BMap.Point(116.40364273508333, 40.03589644341667);
map.centerAndZoom(point, 10);
map.enableScrollWheelZoom(true);

//	simple marker
var stations = [];
for (var i = 0; i < stationLocation.length; i++) {
	var marker = new BMap.Marker(new BMap.Point(stationLocation[i][0], stationLocation[i][1]));
	marker.addEventListener("click", function(e) {
		for (i = 0; i < stations.length; i++) {
			if (stations[i] == e.target) {
				redRawLine(i);
				//	todo, refresh with station id
			}
		}
	});
	map.addOverlay(marker);
	stations.push(marker);
}
//	todo, add heat map, and dynamic change