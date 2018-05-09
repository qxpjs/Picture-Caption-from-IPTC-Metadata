//This library contains functions to add basic checks to the JavaScripts.

if (typeof (setUnits) == "undefined") {
	//import measurements
	app.importScript(app.getAppScriptsFolder() + "/Dependencies/qx_measurements.js");
	console.log("Loaded library for measurements from application.");
}

/* Function to check if a layout is open
Returns: true or false
*/
function isLayoutOpen() {
	let layout = app.activeLayout();//get the layout
	if (layout.layoutID >= 0) {//if layout is open
		return true;
	}
	else {
		alert("Please open a layout to run the script");//if no layout is open
		return false;
	}
}

/* Function to check if a box is selected
Returns: true or false
*/
function isBoxSelected() {
	let box = app.activeBoxes();//get the box
	if (box != "") {//if box is selected
		return true;
	}
	else {
		alert("Please select a box to run the script");//if no box is selected
		return false;
	}
}

/* Function to return all selected text boxes, all other box types are ignored
Returns: an array of all selected text boxes || null if no box is found
*/
function getSelectedTextBoxes() {
	return getSelectedBoxesOfType("text");
}

/* Function to return all selected picture boxes, all other box types are ignored
Returns: an array of all selected picture boxes || null if no box is found
*/
function getSelectedPictureBoxes() {
	return getSelectedBoxesOfType("picture");
}

/* Function to return all selected boxes of provided type, all other box types are ignored
strBoxType: The type of box to return, like "text", "picture"
Returns: an array of all selected boxes matching the criteria || null if no box is found
*/
function getSelectedBoxesOfType(strBoxType) {
	let activeBoxes = app.activeBoxesDOM(); //Gets array of selected boxes, of all types
	let typeBoxes = [];
	let strNoSelectionAlert = "Please select at least one " + strBoxType + " box to run the script.";

	//Get all Boxes of matching Type
	if (activeBoxes != null) //Check if at least one box is selected
	{
		for (let i = 0; i < activeBoxes.length; i++) {
			if (activeBoxes[i].getAttribute('box-content-type') === strBoxType) {
				typeBoxes.push(activeBoxes[i]);
			}
		}

		if (typeBoxes.length === 0) {
			//Set to null if no box is found
			alert(strNoSelectionAlert);
			typeBoxes = null; //if no box is found
		}
		else {
			console.log("Found " + typeBoxes.length + " " + strBoxType + " box(es) from " + activeBoxes.length + " selected box(es).");
		}
	}
	else {//No box is selected
		typeBoxes = null;
		alert(strNoSelectionAlert);
	}

	return typeBoxes;
}

/* Function to return the selected box, only if a single box is selected
Returns: the selected box, if a single box is selected || null otherwise
*/
function getSelectedBox() {
	let activeBoxes = app.activeBoxesDOM();//gets the array of selected boxes
	if (activeBoxes != null && activeBoxes.length == 1)// check if single box is selected
		return activeBoxes[0];
	else
		return null;
}

//function to check whether a single text box is selected and return it
function getSelectedBoxOfType(contentType) {
	let activeBoxes = app.activeBoxesDOM();//gets the array of selected boxes
	if (activeBoxes != null && activeBoxes.length == 1 && activeBoxes[0].getAttribute('box-content-type') == contentType)// check if single, box is selected of specified type
		return activeBoxes[0];
	alert("Please select one " + contentType + " box to run the script");//if no box or more than one box is selected
	return null;
}


/* Function to convert URI path to file path
Returns: File Path
*/
function convertURIToFilePath(filePath) {
	filePath = "file:///" + filePath.replace(/\\/g, "\/");
	return filePath;
}

/* Function to convert file path to URI path
Returns: URI Path
*/
function convertFilePathToURI(filePath) {
	filePath = filePath.replace("file:///", "");
	let pdfIndex = filePath.indexOf("#page");
	if (pdfIndex >= 0) {
		filePath = filePath.substring(0, pdfIndex);
	}
	return filePath;
}

/* Function to get dimensions of pasteboard for a layout
layout: The reference to layout from which to get the dimensions
Returns: An object with pasteboard Height and Width
*/
function getPasteboardDims(layout) {
	let layoutDimensions = layout.getPrintLayoutOptions();
	let pageHeight, pageWidth, pasteboardHeight, pasteboardWidth, pasteboardDimensions;
	if (layoutDimensions == null) {//Assume iPad size for Digital Layouts, getPrintLayoutOptions does not work for them
		pageHeight = "1024px";
		pageWidth = "768px";
	}
	else {
		pageHeight = layoutDimensions.pageHeight;
		pageWidth = layoutDimensions.pageWidth;
	}
	pasteboardHeight = convertPointsToAnyUnit(convertAnyUnitToPoints(pageHeight) + 72, getUnits(pageHeight));
	pasteboardWidth = convertPointsToAnyUnit(convertAnyUnitToPoints(pageWidth) * 3, getUnits(pageWidth));
	pasteboardDimensions = { height: pasteboardHeight, width: pasteboardWidth };
	return pasteboardDimensions;
}

/* Function to escape reserved Regex characters
str: String to format
Returns: Formatted string
*/
function escapeRegexChars(str) {
	console.log("String before escaping regex chars: " + str);
	str = str.replace(/\^/g, "\\^");
	str = str.replace(/\$/g, "\\$");
	str = str.replace(/\(/g, "\\(");
	str = str.replace(/\)/g, "\)");
	str = str.replace(/\"/g, "\\\"");
	str = str.replace(/\'/g, "\\'");
	str = str.replace(/\./g, "\\.");
	str = str.replace(/\*/g, "\\*");
	str = str.replace(/\?/g, "\\?");
	str = str.replace(/\+/g, "\\+");
	str = str.replace(/\[/g, "\\[");
	str = str.replace(/\]/g, "\\]");
	str = str.replace(/\</g, "\\<");
	str = str.replace(/\>/g, "\\>");
	str = str.replace(/\\/g, "\\\\");
	str = str.replace(/\//g, "\\/");
	str = str.replace(/\|/g, "\\|");
	str = str.replace(/\{/g, "\\{");
	str = str.replace(/\}/g, "\\}");
	str = str.replace(/\-/g, "\\-");
	console.log("String after escaping regex chars: " + str);
	return str;
}

/* Function to find an item's index in an array
itemToFind: the Item whose index is to be found
arrList: The array to search
boolIsCaseSensitive: to ignore case
Returns the index of item, if found || -1 if not found
*/
function findItemIndexInArray(itemToFind, arrList, boolIsCaseSensitive) {
	let itemIndex = -1;
	//Search for the Index to Input in the Array
	if (boolIsCaseSensitive) {
		//Case Sensitive Search
		itemIndex = arrList.indexOf(itemToFind);
	}
	else {//Ignore Case
		//Convert List To String, Convert It To Lower Case, make it an Array Again, Search the String
		itemIndex = arrList.join("~~~~~").toLowerCase().split("~~~~~").indexOf(itemToFind.toLowerCase());
	}

	return itemIndex;
}

/* Function to convert a string to number, with logging
*/
function convertToNumber(toConvert) {
	if (toConvert == "") {
		toConvert = Infinity;
	}
	else if (isNaN(toConvert)) {
		console.log("'" + toConvert + "' is not a number.");
		toConvert = parseFloat(toConvert);
		if (isNaN(toConvert)) {//Still not a number
			toConvert = Infinity;
		}
		console.log("Converted to number: " + toConvert);
	}
	else {
		console.log("'" + toConvert + "' is a VALID number.");
	}

	return toConvert;
}