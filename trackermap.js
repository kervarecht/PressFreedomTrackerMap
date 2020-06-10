//Function to get CSV from PressFreedomTracker and inserts it to "demo" on the page
var getFreedomTrackerInfo = function () {

	var url = "https://pressfreedomtracker.us/all-incidents/export/";
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("demo").innerHTML = this.responseText;
		}
	};

	xhttp.open("GET", url, true);
	xhttp.send();
};

//Function to parse the CSV once it's done
var parseCSV = function (csv) {

}