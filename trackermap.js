//Function to get CSV from PressFreedomTracker and inserts it to "demo" on the page
var getFreedomTrackerInfo = function () {

	var url = "https://pressfreedomtracker.us/all-incidents/export/";
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			
			document.getElementById("demo").innerHTML = parseCSV(this.response);
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

		var obj = {};
		var currentline = lines[i].split(","); //hoping the commas are escaped otherwise this won't work

		for (var j = 0; j < headers.length; j++) {
			obj[headers[j]] = currentline[j];
		}

		result.push(obj);

	}
	return JSON.stringify(result);
}

getFreedomTrackerInfo();