/*
File: Picture Caption from IPTC Metadata.js
Description: This script creates a caption box containing IPTC caption for the selected picture box
*/

//Import the EXIF Library
app.importScript(app.getAppScriptsFolder() + "/Dependencies/exif.js");

//import basic checks
if (typeof (isLayoutOpen) == "undefined") {
	//import basic checks
	app.importScript(app.getAppScriptsFolder() + "/Dependencies/qx_validations.js");
	console.log("Loaded library for basic validation checks from application.");
}

//import Box Creation library
if (typeof (makeCaption) == "undefined") {
	//import basic checks
	app.importScript(app.getAppScriptsFolder() + "/Dependencies/qx_create_box.js");
	console.log("Loaded library qx_create_box for box creation.");
}

//Get the Tags
getTagsFromSelectedBoxes();

function getTagsFromSelectedBoxes() {
	let promise = new Promise(function (resolve, reject)//promise is used to ensure this task completes and return a promise followed by further execution
	{
		setTimeout(function () {
			//Configure which Tag to get
			//Valid IPTC Tag Names: keywords, dateCreated, byline, bylineTitle, headline, credit, copyright, caption, captionWriter
			let iptcTagToGet = "caption";

			//Get all Selected Boxes
			boxes = getSelectedPictureBoxes();

			if (boxes != null && boxes.length == 1)// check if one box is selected
			{
				getIptcTagFromImage(boxes[0], iptcTagToGet);
			}
			/*
			else {
				alert("Please select a single box to run the script. Tables, Grouped Items, and Composition Zones are not supported.");
			}*/
			resolve({});
		}, 0);
	});
	return promise;

}

//Pass the "Image Source" and the "Tag Name"
//Valid IPTC Tag Names: keywords, dateCreated, byline, bylineTitle, headline, credit, copyright, caption, captionWriter
function getIptcTagFromImage(imgBox, tagName) {
	//Set the default value
	let tagValue = "Not Defined";
	let validIptcTags = ["keywords", "dateCreated", "byline", "bylineTitle", "headline", "credit", "copyright", "caption", "captionWriter"];

	//Find the Image in Box
	qImg = imgBox.getElementsByTagName("qx-img");

	if (null == qImg || qImg.length <= 0) {//Must be a Text Box
		alert("Please select a PICTURE box, with a image, to run this script!");
	}
	else {
		let imgSrc = qImg[0].getAttribute("src");
		//Check if the Source is Valid
		if (null === imgSrc) {//Must be an Empty Picture Box
			alert("Please select a PICTURE box, with a image, to run this script!");
		}
		else if (!doesFileExist(imgSrc)) {
			alert("File " + imgSrc + " does not exist!");
		}
		else {
			imgSrc = convertFilePath(imgSrc);

			//is Tag Valid	
			if (validIptcTags.indexOf(tagName) >= 0) {

				//Create a temporary img element to Pass to EXIF library
				let img1 = document.createElement("img");

				//Set the src to the src image of the selected box
				img1.setAttribute("src", imgSrc);

				//wait for the image to Load		

				img1.onload = function () {
					EXIF.getData(img1, function () {
						tagValue = EXIF.getIptcTag(this, tagName);

						if (tagValue) {
							console.log("Image: " + imgSrc.replace(/^.*[\\\/]/, '') + ", Tag Name: " + tagName + ", Tag value: " + tagValue);

							//create the caption box
							makeCaption(imgBox, tagValue);
						}
						else {
							let errString = "IPTC Tag '" + tagName + "' is NOT defined for this image.";
							console.log(errString);
							alert(errString);

						}
					});
					img1.remove();
				}

				//Check for Missing Images and Errors

				img1.onerror = function () {
					alert("Unable to get the Tags. Make sure this file exists and is valid:\n" + imgSrc);
					img1.remove();
				}
			}
			else {
				alert("IPTC Tag Name '" + tagName + "' is NOT valid. Valid tags are: " + validIptcTags.toString());
			}
		}
	}
}

/* Convert File Paths to acceptable format */
function convertFilePath(filePath) {
	//Change path according to OS
	filePath = filePath.replace("file:///", "");
	if (filePath.search(/\//) < 0) {//Mac OS
		//Replace all Colons with Slashes
		filePath = filePath.replace(/:/g, "/");
		//Add "Volumes" along with the file protocol
		filePath = "Volumes/" + filePath;
	}
	filePath = "file:///" + filePath;
	return filePath;
}

/* Checks if the given file exists */
function doesFileExist(filePath) {
	filePath = convertFilePath(filePath);
	filePath = filePath.replace("file:///", "");
	if (!fs.existsSync(filePath)) {//check if Mac OS
		let filePath = "/" + filePath;
	}
	return fs.existsSync(filePath);
}
