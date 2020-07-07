//DATA CODE
//Function to get CSV from PressFreedomTracker
var getFreedomTrackerInfo = function (callback) {
	//var url = "https://pressfreedomtracker.us/all-incidents/export/"; //Actual URL
	var url = "/csv" //DEV URL
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			//Parsing CSV in response and creating an array of objects to work with
			var freedomTrackerResponseData;
			Papa.parse(this.response, {
				complete: function (results) {
					freedomTrackerResponseData = callback(createNewsObjects(results)); //pass result into callback function
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
				obj[headers[j]] = resultsData[i][j];
			}
		}
		results.push(obj);
	}
	return results;
}; 

//Function to get counts by state
function getCountsByState(array) {
	var countsByState = {};
	for (var i = 0; i < array.length; i++) {
		var stateToCheck = array[i].state;
		if (!stateToCheck || typeof stateToCheck != "string") {
			console.log(stateToCheck);
			statetoCheck = "undefined";
			countsByState[statetoCheck] ? countsByState[stateToCheck] += 1 : countsByState[statetoCheck] = 1;
        }
		else if (!countsByState[stateToCheck]) {
			countsByState[stateToCheck] = 1;
		}
		else {
			console.log(stateToCheck);
			countsByState[stateToCheck] += 1;
        }
	}
	console.log(countsByState);
	return countsByState;
}

//MAP WIDGET CODE
//With much help from http://www.petercollingridge.co.uk/tutorials/svg/interactive/pan-and-zoom/

//Map pan function

function pan(dx, dy, matrixGroup, transformMatrix) {
	transformMatrix[4] += dx;
	transformMatrix[5] += dy;
	var newMatrix = "matrix(" + transformMatrix.join(' ') + ")";
	matrixGroup.setAttributeNS(null, "transform", newMatrix);
}

//Map zoom functions
function zoom(scale, matrixGroup, transformMatrix, centerX, centerY) {
	for (var i = 0; i < 4; i++) {
		transformMatrix[i] *= scale;
	}
	transformMatrix[4] += (1 - scale) * centerX;
	transformMatrix[5] += (1 - scale) * centerY;

	var newMatrix = "matrix(" + transformMatrix.join(' ') + ")";
	matrixGroup.setAttributeNS(null, "transform", newMatrix);
}


window.onload = function () {
	//Find SVG
	var svgObject = document.getElementById('map').contentDocument;
	var svg = svgObject.getElementsByTagName("svg")[0];

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
			console.log(changeInX, changeInY);
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
			//Outline the state on hover
			svgObject.getElementById(path.id).addEventListener("mouseover", function (mouseEvent) {
				elementId = mouseEvent.target.id;
				svgObject.getElementById(elementId).setAttribute("style", "stroke:black");
				svgObject.getElementById(elementId).setAttribute("stroke-width", 2);
			});
			//Remove state outline when leaving
			svgObject.getElementById(path.id).addEventListener("mouseleave", function (mouseEvent) {
				elementId = mouseEvent.target.id;
				svgObject.getElementById(elementId).setAttribute("style", "stroke: ''");
				svgObject.getElementById(elementId).setAttribute("stroke-width", 0)

			});
        }
	});
}

//