//DATA CODE
//Function to get CSV from PressFreedomTracker
var getFreedomTrackerInfo = function (callback) {
	//var url = "https://pressfreedomtracker.us/all-incidents/export/"; //Actual URL
	var url = "/csv" //DEV URL
	/*Update to use fetch instead
	fetch(url).then(response => {
		console.log(response.body);
	});
	*/
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			//Parsing CSV in response and creating an array of objects to work with
			var freedomTrackerResponseData, countsByState, quartersFromMaxValue;
			Papa.parse(this.response, {
				complete: function (results) {
					freedomTrackerResponseData = createNewsObjects(results); //pass result into callback function
					countsByState = getCountsByState(freedomTrackerResponseData);
					quartersFromMaxValue = defineQuartersFromMax(countsByState);
					//This isn't working but the map exists and the data passed in should be valid by this point
					var states = Object.keys(countsByState);
					colorStateByFrequencyQuarter("AR", countsByState, quartersFromMaxValue, mapColors);
				}
			});
		}
		
	}

	xhttp.open("GET", url, true);
	xhttp.send();
};

//calling the file
var data = getFreedomTrackerInfo(getCountsByState); 


//DATA PROCESSING CODE

//Function to convert parsed CSV to array of objects
function createNewsObjects(resultsObject) {
	var resultsData = resultsObject.data;
	results = [];
	var headers = resultsData[0];
	for (var i = 1; i < resultsData.length; i++) {
		var obj = {}
		if (resultsData[i].length == headers.length) {
			for (var j = 0; j < headers.length; j++) {
				//Parse state names to just abbreviations for US states
				if (headers[j] == "state" && resultsData[i][j].includes("(")) {
					//Match values inside parentheses and only return that
					var regExMatch = /\(([^)]+)\)/;
					var strippedState = resultsData[i][j].match(regExMatch)[1];
					obj[headers[j]] = strippedState;
				}
				//Data is not regular so need exceptions for DC and North Carolina
				else if (headers[j] == "state" && resultsData[i][j] === "North Carolina") {
					obj[headers[j]] = "NC";
				}
				else if (headers[j] == "state" && resultsData[i][j] === "District of Columbia") {
					obj[headers[j]] = "DC";
				}
				else {
					obj[headers[j]] = resultsData[i][j];
				}
			}
		}
		results.push(obj);
	}
	return results;
}; 

//Function to get counts by state.
//Add state with count 1 if it doesn't exist, otherwise increment state count by 1.
function getCountsByState(array) {
	var countsByState = {};
	for (var i = 0; i < array.length; i++) {
		var stateToCheck = array[i].state;
		//If the data isn't what's expected
		if (!stateToCheck || typeof stateToCheck != "string") {
			statetoCheck = "undefined";
			countsByState[statetoCheck] ? countsByState[stateToCheck] += 1 : countsByState[statetoCheck] = 1;
		}
		else if (!countsByState[stateToCheck]) {
			countsByState[stateToCheck] = 1;
		}
		else {
			countsByState[stateToCheck] += 1;
        }
	}
	defineQuartersFromMax(countsByState);
	return countsByState;
}

//Define quartiles depending on max value
function defineQuartersFromMax(values) {
	listOfKeys = Object.keys(values);
	var currentMax, firstQuarter, secondQuarter, thirdQuarter;
	var quarterValues = [];
	currentMax = 0;
	for (var i = 0; i < listOfKeys.length; i++) {
		if (values[listOfKeys[i]] > currentMax) {
			currentMax = values[listOfKeys[i]];
		}
	}
	firstQuarter = Math.floor(currentMax * 0.25);
	secondQuarter = Math.floor(currentMax * 0.5);
	thirdQuarter = Math.floor(currentMax * 0.75);
	quarterValues.push(firstQuarter, secondQuarter, thirdQuarter, currentMax);
	return quarterValues;
}

//MAP WIDGET CODE

//Map element
var mapElement;

//Map pan function
//With much help from http://www.petercollingridge.co.uk/tutorials/svg/interactive/pan-and-zoom/
function pan(dx, dy, matrixGroup, transformMatrix) {
	transformMatrix[4] += dx;
	transformMatrix[5] += dy;
	var newMatrix = "matrix(" + transformMatrix.join(' ') + ")";
	matrixGroup.setAttributeNS(null, "transform", newMatrix);
}

//Map zoom function
function zoom(scale, matrixGroup, transformMatrix, centerX, centerY) {
	for (var i = 0; i < 4; i++) {
		transformMatrix[i] *= scale;
	}
	transformMatrix[4] += (1 - scale) * centerX;
	transformMatrix[5] += (1 - scale) * centerY;

	var newMatrix = "matrix(" + transformMatrix.join(' ') + ")";
	matrixGroup.setAttributeNS(null, "transform", newMatrix);
}

//Map state fill colors
var mapColors = {
	"high": "#ff0000",
	"medium": "#ff5a00",
	"low": "#ff9a00",
	"minimal": "#ffce00",
	"noData": "#f0ff00"
}

//Actual code to run map
window.onload = function () {
	//Find SVG
	var svgObject = document.getElementById('map').contentDocument;
	var svg = svgObject.getElementsByTagName("svg")[0];
	mapElement = svgObject;

	//Initialize SVG for scroll and pan functions
	var transformMatrix = [1, 0, 0, 1, 0, 0];
	var centerX = svg.getAttribute("width")/ 2;
	var centerY = svg.getAttribute("height") / 2;	
	var matrixGroup = svgObject.getElementById("map-group");

	//Map transform from legend - zoom in/out, pan 4 directions
	svgObject.getElementById("zoom-in").addEventListener("click", function () {
		zoom(0.8, matrixGroup, transformMatrix, centerX, centerY);
	});
	svgObject.getElementById("zoom-out").addEventListener("click", function () {
		zoom(1.25, matrixGroup, transformMatrix, centerX, centerY);
	});
	svgObject.getElementById("pan-left").addEventListener("click", function () {
		pan(-25, 0, matrixGroup, transformMatrix);
	});
	svgObject.getElementById("pan-right").addEventListener("click", function () {
		pan(25, 0, matrixGroup, transformMatrix);
	});
	svgObject.getElementById("pan-up").addEventListener("click", function () {
		pan(0, 25, matrixGroup, transformMatrix);
	});
	svgObject.getElementById("pan-down").addEventListener("click", function () {
		pan(0, -25, matrixGroup, transformMatrix);
	});

	//Map transforms from drag and scroll;
	//Zoom in/out on scroll
	svgObject.getElementById("map-group").addEventListener("wheel", function (mouseEvent) {
		mouseEvent.preventDefault();
		var scale = 1;
		var transform = scale += mouseEvent.deltaY * 0.01;
		zoom(transform, matrixGroup, transformMatrix, centerX, centerY);
	});
	//Pan on drag
	var mapIsPanning;
	svgObject.getElementById("map-group").addEventListener("mousedown", function (mouseEvent) {
		mapIsPanning = true;
	});
	svgObject.getElementById("map-group").addEventListener("mousemove", function (mouseEvent) {
		if (mapIsPanning) {
			var changeInX = mouseEvent.movementX;
			var changeInY = mouseEvent.movementY;
			if (!changeInX) {
				changeInX = 0;
			}
			if (!changeInY) {
				changeInY = 0;
            }
			pan(changeInX, changeInY, matrixGroup, transformMatrix);
		}
	});
	svgObject.getElementById("map-group").addEventListener("mouseup", function () {
		mapIsPanning = false;
	});

	//Create an array from the HTMLCollection and grab every path element from the SVG
	var paths = Array.from(svgObject.getElementsByTagName("path")).forEach(function (path) {
		if (!path.id) {
			console.log("no ID found");
		}
		else {
			//Get element ID
			var stateElement = svgObject.getElementById(path.id);
			//Outline the state on hover
			stateElement.addEventListener("mouseover", function (mouseEvent) {
				var element = svgObject.getElementById(mouseEvent.target.id);
				element.setAttribute("style", "stroke:black");
				element.setAttribute("stroke-width", 2);
			});
			//Remove state outline when leaving
			stateElement.addEventListener("mouseleave", function (mouseEvent) {
				var element = svgObject.getElementById(mouseEvent.target.id);
				element.setAttribute("style", "stroke: ''");
				element.setAttribute("stroke-width", 0);
			});
		}
	});
}

//Functions to inject data into map
function getStateElement(id) {
	console.log(id);
	if (!mapElement.getElementById(id)) {
		console.log("shit ain't loaded yet");
		getStateElement(id);
	}
	else {
		return mapElement.getElementById(id);
	}
}

function colorStateByFrequencyQuarter(stateId, values, quarterValues, colors) {
	var element = getStateElement(stateId);
	var count = values[stateId];
	if (count == 0) {
		console.log("count = 0");
		element.setAttribute("fill", colors.noData);
	}
	else if (count > 0 && count <= quarterValues[0]) {
		console.log("count between 0 and " + quarterValues[0]);
		element.setAttribute("fill", colors.minimal);
	}
	else if (count > quarterValues[0] && count <= quarterValues[1]) {
		console.log("count between " + quarterValues[0] + " and " + quartervalues[1]);
		element.setAttribute("fill", colors.low);
	}
	else if (count > quarterValues[1] && count <= quarterValues[2]) {
		console.log("count between " + quarterValues[1] + " and " + quartervalues[2]);
		element.setAttribute("fill", colors.medium);
	}
	else if (count > quarterValues[2]) {
	    console.log("high value!");
		element.setAttribute("fill", colors.high);
	}	
};