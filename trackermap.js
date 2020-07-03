
//DATA CODE
//Function to get CSV from PressFreedomTracker and inserts it to "demo" on the page
var getFreedomTrackerInfo = function () {
	var url = "https://pressfreedomtracker.us/all-incidents/export/";
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			
			var freedomTrackerResponseData = JSON.parse(parseCSV(this.response))[0].title;
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
		var currentline = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); //hoping the commas are escaped otherwise this might not work

		for (var j = 0; j < headers.length; j++) {
				obj[headers[j]] = currentline[j];
		}
		result.push(obj);
	}
	return JSON.stringify(result);
}

// getFreedomTrackerInfo(); //commented out for now to prevent hitting the API over and over


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
		zoom(1.25, matrixGroup, transformMatrix, centerX, centerY);
	});
	svgObject.getElementById("zoom-out").addEventListener("click", function () {
		zoom(0.8, matrixGroup, transformMatrix, centerX, centerY);
	});



	//Detect Scroll and Drag and do map transforms
	//keep track of mouse position
	var mousePositionX, mousePositionY
	var trackMouse = true;
	svgObject.getElementById("map-group").addEventListener("mouseover", function (mouseEvent) {
		if (trackMouse) {
			mousePositionX = mouseEvent.mouseX;
			mousePositionY = mouseEvent.mouseY;
        }
	});
	//add event listener for scrolling
	svgObject.getElementById("map-group").addEventListener("mousewheel", function (mouseEvent) {

	});
	//event listener for dragging
	svgObject.getElementById("map-group").addEventListener("drag", function (mouseEvent) {
		console.log("drag event fired");
		//stop tracking every cursor change for the length of drag
		trackMouse = false;
		var currentMouseX, currentMouseY, changeInX, changeInY;
		currentMouseX = mouseEvent.mouseX;
		currentMouseY = mouseEvent.mouseY;
		changeInX = mousePositionX - currentMouseX;
		changeInY = mousePositionY - currentMouseY;
		pan(changeInX, changeInY, matrixGroup);
	});
	//start tracking cursor again after dragging is done
	svgObject.getElementById("map-group").addEventListener("ondrop", function (mouseEvent) {
		trackMouse = true;
		console.log("ondrop event fired");
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
			//add event listener for clicking
			svgObject.getElementById(path.id).addEventListener("click", function (mouseEvent) {
				elementId = mouseEvent.target.id;
			});
        }
	});
}

/*zoom function - event listener detects the wheel/scroll above but doesn't do the zoom.
function zoom(event) {
	event.preventDefault();

	scale += event.deltaY * -0.01;

	// Restrict scale
	scale = Math.min(Math.max(.125, scale), 4);

	// Apply scale transform
	el.style.transform = `scale(${scale})`;
}

let scale = 1;
const el = document.querySelector('div');
el.onwheel = zoom;
*/