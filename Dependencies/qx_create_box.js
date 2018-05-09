//This script creates a caption box for the selected box

function makeCaption(box, capText) {
	let capPosition, capHeight, capOffset;
	let inputScriptPath = app.getAppScriptsFolder() + "/Dependencies/qx_measurements.js";
	app.evalScript("", inputScriptPath, 0);
	//get page height
	let layout = app.activeLayout();
	let pageDims = layout.getPrintLayoutOptions();
	let pageHt;
	
	if (pageDims == null || pageDims == "") {
		pageHt = "1024px";//Default value for digital layouts
		console.log("Could not find page height. Assuming it as 1024px");
	}
	else {
		pageHt = pageDims.pageHeight;
		console.log("Found page height: " + pageHt);
	}

	//get top and bottom of selected box
	let bTop = box.style.qxTop;
	let bBottom = box.style.qxBottom;
	console.log("Selected box offsets: Top: " + bTop + ", Bottom: " + bBottom);

	//get current vertical units
	let currVertUnits = getUnits(box.style.qxTop);
	console.log("Current Vertical measurement units: " + currVertUnits);

	//get position of caption box
	capPosition = getCapPosition();
	let maxOffset;

	console.log("Placing caption box at " + capPosition);
	if (capPosition) {
		let defHt = convertPointsToAnyUnit(72, currVertUnits);
		//get caption box height 
		capHeight = getNumInputWithUnits("Please specify height for the caption box?", defHt, currVertUnits, "0.1pt", "224in", true);
		if (capHeight) {
			console.log("Entered height of caption box: " + capHeight);
			//calculate max offset values
			if (capPosition == "top") {
				maxOffset = convertAnyUnitToPoints(bTop) + convertAnyUnitToPoints("0.5in");
			}
			else {
				maxOffset = (convertAnyUnitToPoints(pageHt) + convertAnyUnitToPoints(bBottom)) + convertAnyUnitToPoints("0.5in");
			}
			maxOffset = convertPointsToAnyUnit(maxOffset, currVertUnits);
			capOffset = getNumInputWithUnits("Please specify vertical offset for the caption box?", defHt, currVertUnits, "0" + currVertUnits, maxOffset, true);
			console.log("Entered offsets of caption box: " + capOffset);
			if (capOffset) {
				//The caption text
				if (!capText) {
					capText = prompt("Please Enter the caption Text: ");
				}
				if (capText) {
					console.log("Caption Text: " + capText);
					//create caption box
					createBoxCaption(box, capText, capPosition, capOffset, capHeight);
				}
			}
		}
	}
}

//This function gets a file from a sub folder in application folder
function getPathFromAppFolder(subFolderName, filename) {
	let appFolderPath = app.getAppScriptsFolder();

	return appFolderPath + "/" + subFolderName + "/" + filename;

}

//This function gets the position of caption box
function getCapPosition() {
	let flag = 0;
	while (flag == 0) {
		let input = prompt("Where do you want to place the caption (Top or Bottom)?", "Top");
		if (input == null) {
			return null;
		}
		else {
			input = input.trim().toLowerCase();
			if (!input.match(/^(top|bottom)$/)) //Invalid Position - Set to top
			{
				input = "top";
				alert("Invalid Position. Caption will be placed at the top");
			}
			return input;
		}
	}
}


/* Creates a Text Box as caption for the parent box passed to this function

boxNode			: The box for which the caption is required
captionText		: The caption to setActive
captionPosition	: "Top" or "Bottom"
captionOffset	: caption box's distance from parent box (Number. Current ruler units will be used, units in the string will be ignored)
captionHeight	: The height of box containing the caption (Number. Current ruler units will be used, units in the string will be ignored)
*/

function createBoxCaption(boxNode, captionText, captionPosition, captionOffset, captionHeight) {
	let captionLeft, captionRight, captionTop, captionBottom;
	//get Coordinated for Source Box
	let boxLeft = convertAnyUnitToPoints(boxNode.style.qxLeft) + "pt";
	let boxRight = convertAnyUnitToPoints(boxNode.style.qxRight) + "pt";
	let boxTop = convertAnyUnitToPoints(boxNode.style.qxTop);
	let boxBottom = convertAnyUnitToPoints(boxNode.style.qxBottom);

	//Convert to Numbers
	captionOffset = convertAnyUnitToPoints(captionOffset);
	captionHeight = convertAnyUnitToPoints(captionHeight);

	//Set the page number same as source box
	let boxPage = boxNode.style.qxPage;

	//Set the Item Coordinates
	if (captionPosition.toLowerCase().trim() === "top") {
		//Change Top and Bottom
		captionTop = (boxTop - captionOffset - captionHeight);
		captionBottom = (captionTop + captionHeight);
	}
	else //Place at the Bottom of the box
	{
		//Change Top and Bottom
		captionTop = (boxBottom + captionOffset);
		captionBottom = (captionTop + captionHeight);
	}
	captionTop = captionTop + "pt";
	captionBottom = captionBottom + "pt";
	console.log("Creating new box with offsets: Left: " + boxLeft + ",Right: " + boxRight + ",Top: " + captionTop + ",Bottom: " + captionBottom);
	let newTextBox = createTextBox(boxLeft, boxRight, captionTop, captionBottom, boxPage, captionText);

	boxNode.parentNode.appendChild(newTextBox);
}

/* Creates a Text Box Node */
function createTextBox(Left, Right, Top, Bottom, pageNum, textContent) {
	let blankBox = document.createElement("qx-box");
	let blankStory = document.createElement("qx-story");
	let blankParagraph = document.createElement("qx-p");
	let blankSpan = document.createElement("qx-span");
	let textNode = document.createTextNode(textContent);

	//Set up the Para Attributes
	//blankParagraph.setAttribute("para-style-name", "pr-Normal");
	blankParagraph.classList.add("pr-Normal");
	blankParagraph.style.qxTextAlign = "center";

	//Set up Story Attributes
	blankStory.style.qxWritingMode = "horizontal-tb";

	//Set up Box Attributes
	blankBox.setAttribute("box-content-type", "text");
	/*** Style Attributes ***/
	blankBox.style.qxLeft = Left;
	blankBox.style.qxRight = Right;
	blankBox.style.qxTop = Top;
	blankBox.style.qxBottom = Bottom;
	blankBox.style.qxPage = pageNum;

	blankSpan.appendChild(textNode);

	blankParagraph.appendChild(blankSpan);

	blankStory.appendChild(blankParagraph);

	blankBox.appendChild(blankStory);

	return blankBox;
}

/* Creates a Picture Box Node */
function createPictureBox(Left, Right, Top, Bottom, pageNum, imgSource) {
	let blankBox = document.createElement("qx-box");
	let imgTag = document.createElement("qx-img");

	//Set up Box Attributes
	blankBox.setAttribute("box-content-type", "picture");

	//add the image to img tags
	imgTag.setAttribute("src", imgSource);
	console.log("Added src: " + imgSource + " to the image");

	/*** Style Attributes ***/
	blankBox.style.qxLeft = Left;
	blankBox.style.qxRight = Right;
	blankBox.style.qxTop = Top;
	blankBox.style.qxBottom = Bottom;
	blankBox.style.qxPage = pageNum;

	blankBox.appendChild(imgTag);

	return blankBox;
}