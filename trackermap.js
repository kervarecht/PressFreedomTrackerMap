
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
//Add event listeners for wheel and drag over the SVG HTML element

window.onload = function () {
	//Find SVG
	var svgObject = document.getElementById('map').contentDocument;
	//Grab every path element from the SVG
	var paths = Array.from(svgObject.getElementsByTagName("path")).forEach(function (path) {
		if (!path.id) {
			console.log("no ID found");
		}
		else {
			//add event listener for hovering
			console.log(path.id);
			svgObject.getElementById(path.id).addEventListener("mouseover", function (mouseEvent) {
				elementId = mouseEvent.target.id;
				svgObject.getElementById(elementId).setAttribute("style", "fill:blue");	
			});

			//add event listener for not being on the element (mouseout)

			//add event listener for clicking

			//add event listener for scrolling
        }
	});

	/*
	paths.forEach(function (path) {
		console.log(this.id);
	}); */
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