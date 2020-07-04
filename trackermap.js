//DATA CODE
//Function to get CSV from PressFreedomTracker and inserts it to "demo" on the page
var getFreedomTrackerInfo = function () {
	//var url = "https://pressfreedomtracker.us/all-incidents/export/";
	var url = "/csv"
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			
			var freedomTrackerResponseData = JSON.parse(parseCSV(this.response));
			//console.log(freedomTrackerResponseData)
		}
	};

	xhttp.open("GET", url, true);
	xhttp.send();
};

//Function to parse the CSV once it's done
//gently updated from https://stackoverflow.com/questions/27979002/convert-csv-data-into-json-format-using-javascript

var parseCSV = function (csv) {
	var lines = csv.split("\n");

	var result = [];
	var headers = lines[0].split(",");
	for (var i = 1; i < lines.length; i++) {
		var obj = {}
		var currentline = lines[i].split(/(?!\B"[^"]*),(?![^"]*"\B)/g); //hoping the commas are escaped otherwise this might not work
		console.log(currentline);
		for (var j = 0; j < headers.length; j++) {
				obj[headers[j]] = currentline[j];
		}
		result.push(obj);
	}
	console.log(JSON.stringify(result));
	return JSON.stringify(result);
}

var data = getFreedomTrackerInfo(); //commented out for now to prevent hitting the API over and over


//MAP WIDGET CODE
//With much help from http://www.petercollingridge.co.uk/tutorials/svg/interactive/pan-and-zoom/

//Map pan function

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


window.onload = function () {
	//Find SVG
	var svgObject = document.getElementById('map').contentDocument;
	var svg = svgObject.getElementsByTagName("svg")[0];
	console.log(svg);
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
    })



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