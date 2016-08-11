//	change svg size
var globalData = null;
var pathAqi = null;
var pathEmotion = null;
//	duration of the transition in ms
var duration = 150;

//	init the overall container
//var svg = d3.select("body").append("svg").attr("width", 960).attr("height", 100)
var svg = d3.select("body").select("svg");
	margin = {top: 20, right: 80, bottom: 30, left: 50};
var width = svg.attr("width") - margin.left - margin.right,
	height = svg.attr("height") - margin.top - margin.bottom;
var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
g.append("defs").append("clipPath")
	.attr("id", "clipPath")
	.append("rect")
		.attr("width", width)
		.attr("height", height);

//	init some related function
//	function to parse time
var parseTime = d3.timeParse("%Y%m%d");
var x = d3.scaleTime().range([0, width]),
	xzhou = d3.scaleTime().range([0, width]),
    y1 = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height, 0]),
    col = d3.scaleOrdinal(d3.schemeCategory10);

var line1 = d3.line()
    	.curve(d3.curveBasis)
    	.x(function(d) { return x(d.date) + offsetX; })
    	.y(function(d) { return y1(d.aqi); });
var line2 = d3.line()
    	.curve(d3.curveBasis)
    	.x(function(d) { return x(d.date) + offsetX; })
    	.y(function(d) { return y2(d.emotion); });

//	update the step size, here is one day.
var oneStep = 24 * 60 * 60 * 1000;
var step = 0;
var stepX = 0;
var newDate = new Date();
var timer = null;

function redRawLine(i) {
	console.log("RedRaw the " + i + "line.");
	//	HERE, change the data.tsv to some station-related url
	d3.tsv("data.tsv", type, function(error, data) {
		if (timer != null) {
			offsetX = 0;
			timer.stop();
		}
		if (error) throw error;
	  	x.domain(d3.extent(data, function(d) { return d.date; }));
		y1.domain(d3.extent(data, function(d) { return d.aqi; }));
		y2.domain(d3.extent(data, function(d) { return d.emotion; }));
		col.domain([1, 2]);

		var axisX = d3.axisBottom(x);
		var axisY1 = d3.axisLeft(y1);
		var axisY2 = d3.axisRight(y2);
		axisY1.ticks(3);
		axisY2.ticks(3);

		g.selectAll("g").remove();

		//	draw the axis
		
		axisX = g.append("g")
		    .attr("class", "axisX")
		    .attr("transform", "translate(0," + height + ")")
		    .call(axisX);
		g.append("g")
		    .attr("class", "axisY1")
		    .call(axisY1)
		    .append("text")
			    .attr("transform", "rotate(-90)")
			    .attr("y", 6)
			    .attr("dy", "0.71em")
			    .attr("fill", "#000");
			    //.text("Temperature, ºF");
		g.append("g")
		    .attr("class", "axisY2")
		    .attr("transform", "translate(" + width + ") ")
		    .call(axisY2)
		    .append("text")
			    .attr("transform", "rotate(-90)")
			    .attr("y", 6)
			    .attr("dy", "0.71em")
			    .attr("fill", "#000");
			    //.text("Temperature, ºF");
		var aqi = g.data([data])
			.append("g")
		    	.attr("class", "aqi")
		    	.attr("clip-path", "url(#clipPath)");
		pathAqi = aqi.append("path")
	    	.attr("class", "line")
	    	.attr("d", function(d) { return line1(data); })
	    	.style("stroke", function(d) { return col(1); });
		var emotion = g.data([data])
			.append("g")
				.attr("class", "emotion")
				.attr("clip-path", "url(#clipPath)");
		pathEmotion = emotion.append("path")
	    	.attr("class", "line")
	    	.attr("d", function(d) { return line2(data); })
	    	.style("stroke", function(d) { return col(2); });
		globalData = data;
		newDate = globalData[globalData.length - 1].date;
		timer = d3.interval(go, duration);
	});

	//	data for tsv->object
	function type(d, _, columns) {
	  d.date = parseTime(d.date);
	  //	+ for convert (string) to number
	  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
	  return d;
	}
}

redRawLine(1);

function updateLine() {
	xzhou.domain(d3.extent(globalData, function(d) { return d.date; }));
	g.select(".axisX")
		.call(d3.axisBottom(xzhou));
	stepX = -x(new Date(globalData[0].date.getTime() + oneStep)) + x(globalData[0].date);
	newDate = new Date(newDate.getTime() + oneStep);
	//	HERE: replace random() with the get data thing
	newData = {date:newDate, aqi:Math.random() * 50 + 20, emotion:Math.random() * 50 +20};
	globalData.push(newData);
	globalData.shift();

	pathAqi.data([globalData]).attr("d", function(d) { return line1(d); })
		.transition()
		.duration(duration)
		.attr("transform", "translate(" + step + ")");

	pathEmotion.data([globalData]).attr("d", function(d) { return line2(d); })
		.transition()
		.duration(duration)
		.attr("transform", "translate(" + step + ")");
}