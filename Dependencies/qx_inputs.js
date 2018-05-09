
if (typeof (isLayoutOpen) == "undefined") {
	//import basic checks
	app.importScript(app.getAppScriptsFolder() + "/Dependencies/qx_validations.js");
	console.log("Loaded library qx_validations.js for basic validation checks.");
}

if (typeof (maxPageCount) == "undefined") {
	//import basic checks
	app.importScript(app.getAppScriptsFolder() + "/Dependencies/qx_constants.js");
	console.log("Loaded library qx_constants.js for constants.");
}

/* Function to get a Valid Numeric Input from user
Asks for an Input from the user, showing the string message sent, validates it
arrList: An array containing the List of items to validate the user input
strPrompt: The string to show in the prompt dialog
defaultValue: The string to show as the default value in the prompt dialog. Must be in points if Units are to be handled
minValue: Decides the Minimum Input, Infinity by default. Must be in points if Units are to be handled
maxValue: Decides the Maximum Input, Infinity by default. Must be in points if Units are to be handled
isIntegerMust: Decides if fractions are allowed
inputUnits: The units for user Input

Returns: null if the user cancels the input || The valid user input
*/
function getValidNumericInput(strPrompt, defaultValue = "", minValue = Infinity, maxValue = Infinity, isIntegerMust = false, inputUnits = "") {
	let isNumberValid = false;
	let userInput = null;
	let strRangePrompt = "", strIntegerPrompt = "", strDefaultValue = "";
	let defaultValueWithUnits, minValueWithUnits, maxValueWithUnits;
	let userInputNumber, userInputUnits;

	defaultValueWithUnits = minValueWithUnits = maxValueWithUnits = Infinity;
	userInputNumber = userInputUnits = null;
	//Handle cases where inputUnits are provided
	if (inputUnits != "" && !isValidUnit(inputUnits)) {//Invalid Units
		console.log("Invalid inputUnit '" + inputUnits + "' passed to getValidNumericInput(). Ignoring units in input.");
		inputUnits = ""; //Invalid Units, ignore them
	}

	//make sure the parameters are in order, set to Infinity if invalid
	defaultValue = convertToNumber(defaultValue);
	minValue = convertToNumber(minValue);
	maxValue = convertToNumber(maxValue);

	if (inputUnits != "") {//Some units are specified
		console.log("Working with units: '" + inputUnits + "'");
		if (defaultValue != Infinity) {
			defaultValueWithUnits = convertPointsToAnyUnit(defaultValue, inputUnits);
			strDefaultValue = defaultValueWithUnits.toString();
		}
		if (minValue != Infinity)
			minValueWithUnits = convertPointsToAnyUnit(minValue, inputUnits);
		if (maxValue != Infinity)
			maxValueWithUnits = convertPointsToAnyUnit(maxValue, inputUnits);
		//Modify Prompt if Minimum and/or Maximum  values are specified
		if (minValue != Infinity || maxValue != Infinity)
			strRangePrompt = " (between " + minValueWithUnits + " and " + maxValueWithUnits + ")";
	}
	else {//No units
		if (defaultValue != Infinity) {
			strDefaultValue = defaultValue.toString();
		}
		//Modify Prompt if Minimum and/or Maximum  values are specified
		if (minValue != Infinity || maxValue != Infinity) {
			strRangePrompt = " (between " + minValue + " and " + maxValue + ")";
		}
	}

	//Modify Alert if isIntegerMust is true
	if (isIntegerMust) {
		strIntegerPrompt = " Please note only Integer values are allowed.";
	}

	//Loop till the input is valid
	while (!isNumberValid) {
		//Prompt
		userInput = prompt(strPrompt + strRangePrompt, strDefaultValue);
		if (userInput != null) {
			userInput = userInput.trim();

			userInputNumber = userInput; //Assume only numbers entered
			userInputUnits = ""; //Assume no units entered

			//Do we need to care for the units?
			if (inputUnits != "") {
				userInputNumber = parseFloat(userInput);
				userInputUnits = getUnits(userInput);

				if (userInputUnits == "") {//User did not enter units, assume default
					userInputUnits = inputUnits;
				}
			}

			//Validate Inputs
			if (inputUnits != "" && !isValidUnit(userInputUnits)) {
				//Invalid Units with Number
				alert("Invalid Input! Incorrect units specified. Please try again.");
			}
			else if (inputUnits != "" && isIntegerMust && !isInt(convertBetweenUnits(userInputNumber, userInputUnits, inputUnits))) {
				//Not an integer in the required units
				alert("Invalid Input!" + strIntegerPrompt);
				console.log("Input in Required units: " + convertBetweenUnits(userInputNumber, userInputUnits, inputUnits));
			}
			else if (isNaN(userInputNumber) || userInputNumber == "") {//Not a Number
				alert("Invalid Input! Only numbers are allowed. Please try again.");
			}
			else {//Is a Number, and units are valid
				userInputNumber = parseFloat(userInputNumber);

				//Validate range
				if (isIntegerMust && !isInt(userInputNumber)) {
					alert("Invalid Input!" + strIntegerPrompt);
				}
				else {
					//Convert User's input to Points, if required
					if (inputUnits != "") {
						//Convert the user input to Point for Maximum and Minimum Check
						userInputNumber = convertAnyUnitToPoints(userInputNumber.toString() + userInputUnits);
					}
					if (minValue != Infinity && userInputNumber < minValue) {
						alert("Invalid Input! It is less than the minimum value." + strIntegerPrompt);
					}
					else if (maxValue != Infinity && userInputNumber > maxValue) {
						alert("Invalid Input! It is more than the maximum value." + strIntegerPrompt);
					}
					else {
						isNumberValid = true;
					}
				}
			}
		}
		else {//User canceled input
			console.log("User canceled input.");
			isNumberValid = true; //Assume cancellation to be valid
			return null;
		}
	}

	//Convert return value to correct units
	if (inputUnits != "" && userInputNumber != null) {
		userInputNumber = convertPointsToAnyUnit(userInputNumber, inputUnits);
	}

	//Return the value
	return userInputNumber;
}


/* Function to get a Valid User Input as String

Returns: null if the user cancels the input || The valid user input as String
*/
function getValidStringInput(strPrompt, defaultValue = "") {
	let isInputValid = false;
	let validString = null;

	let inputErr = "Invalid Input. Please enter a valid value.";
	while (!isInputValid) {
		validString = prompt(strPrompt, defaultValue);
		if (validString === null || validString === undefined) {
			console.log("User Cancelled Input.");
			isInputValid = true; //Assume cancellation to be a valid input
			validString = null;
		}
		else if (validString.length < 0) {
			alert(inputErr);
		}
		else {
			isInputValid = true;
		}
	}
	return validString;
}

/* Function to get a Valid User Input from a List sent as an array
Asks for an Input from the user, showing the string message sent, validates it against the item in the array sent as an argument
arrList: An array containing the List of items to validate the user input
strPrompt: The string to show in the prompt dialog
strDefaultValue: The string to show as the default value in the prompt dialog
boolShowListInPrompt: Decides whether to show the List in the Prompt
boolIsCaseSensitive: Decides whether the Input must be case sensitive

Returns: null if the user cancels the input || The valid user input as String
*/
function getValidInputFromList(arrList, strPrompt, strDefaultValue, boolShowListInPrompt, boolIsCaseSensitive) {
	let invalidInputAlert = " is an invalid Input. Please try again.";
	let IsCaseSensitiveAlert = " Please note that the input is Case Sensitive.";
	let isInputValid = false;
	let userInput = "";
	let validInputIndex = -1;

	//Append the prompt with list if required
	if (boolShowListInPrompt) {
		strPrompt += "\r\nValid values: ";
		strPrompt += arrList.join(", ");
	}

	//Append the Alert with Case Sensitive Note if required
	if (boolIsCaseSensitive) {
		invalidInputAlert += IsCaseSensitiveAlert;
	}

	while (!isInputValid) {
		//Prompt the user
		userInput = prompt(strPrompt, strDefaultValue);
		if (null === userInput) {//User Canceled Input
			isInputValid = true; //Assume cancellation to be valid input
			console.log("User canceled input.");
		}
		else {
			userInput = userInput.trim();

			//Search for the Index to Input in the Array
			validInputIndex = findItemIndexInArray(userInput, arrList, boolIsCaseSensitive);

			if (validInputIndex >= 0) {
				console.log("Found '" + userInput + "' in the list.");
				userInput = arrList[validInputIndex];
				isInputValid = true;
			}
			else {
				alert("'" + userInput + "'" + invalidInputAlert);
				console.log("'" + userInput + "'" + invalidInputAlert);
			}
		}
	}

	return userInput;
}


//function to take image path inputs
function getValidPath(inputStr, defVal = "", extensions, updatePDF = false, toFilePath = false, isDirectory = false) {
	let flag = 0;
	let path;
	while (flag == 0) {
		path = prompt(inputStr, defVal);
		if (path != null) {
			path = path.trim();
			console.log("Path: " + path);
			path = path.replace(/^"(.+(?="$))"$/, '$1'); //Remove the quotes in the beginning and end of the path (this happens when you "Copy as path" on Windows)			

			if (isDirectory) {
				if (fs.statSync(path).isDirectory()) {
					if (path.search(/\/$/) > 0 || path.search(/\\$/) > 0)//if the path ends with a slash
					{
						path = path.substring(0, path.length - 1);
					}
					flag = 1;
				}
				else {
					alert("Invalid Directory Path!\nPlease try again.");
				}
				//return path;
			}
			else {
				if (!isValidExtension(path, extensions)) {
					alert("Invalid filepath!");
				}
				else {
					if (fs.existsSync(path.replace(/\\/g, "\\\\"))) {
						if (updatePDF) {
							path = UpdatePathIfPdf(path);
						}
						if (path != null) {
							if (toFilePath) {
								path = convertURIToFilePath(path);
							}
							flag = 1;
							//	return path;
						}
						else {
							flag = 1;
							path = null;//return null;
						}
					}
					else
						alert("File does not exist on given path!\nPlease try again.");
				}
			}

		}
		else {
			path = null;//return null;
			flag = 1;
		}
	}
	return path;
}

function isValidExtension(path, validExtensions) {
	let validity = false;
	let extRegex = /\.(\w+)$/;
	let extM = path.match(extRegex);
	if (extM) {
		let ext = extM[1];
		if (findItemIndexInArray(ext, validExtensions, false) >= 0) {
			validity = true;
		}
	}
	return validity;
}

function UpdatePathIfPdf(imgSource) {
	let pdfMatch = imgSource.search(".pdf");
	if (pdfMatch > 0) {
		let flag = 0;
		let pdfPage;
		let maxPages = app.components.pdf.getPDFNumPages(imgSource.replace(/\\/g, "\\\\"));
		if (maxPages > 1) {
			while (flag == 0) {
				pdfPage = prompt("Please enter the page number of pdf to import", "1");
				if (pdfPage == null) {
					return null;
				}
				if (pdfPage < 1 || pdfPage > maxPages) {
					alert("Please enter a page number between 1 and " + maxPages);
				}
				else
					flag = 1;
			}
		}
		else {
			pdfPage = 1;
		}

		let imgSource = imgSource + '#page=' + pdfPage;

	}
	return imgSource;
}

/* */
function getValidNumericRange(inputStr, defVal = "", minVal = 1, maxVal = maxPageCount) {
	let validInput = false;
	while (!validInput) {
		let range = prompt(inputStr, defVal);
		if (range == null) {
			validInput = true;
			console.log("User Cancelled");
			return null;
		}
		else {
			let regex = /^(\d+)\s*-*\s*(\d*)$/;//regular expression to get the page range
			let match = regex.exec(range);
			if (match) {
				let StartPage = match[1];
				let EndPage = match[2];
				let logStr = "Entered start page = " + StartPage;
				if (EndPage == "")//sets the end page number as start number in case of importing a single page
				{
					EndPage = StartPage;
				}
				else {
					logStr += " and End Page = " + EndPage;
				}
				console.log(logStr);
				StartPage = parseInt(StartPage);
				EndPage = parseInt(EndPage);
				if (StartPage < minVal || StartPage > maxVal || EndPage < minVal || EndPage > maxVal) {
					console.log("Invalid Input!");
					alert("Page Numbers must be between " + minVal + " and " + maxVal);
				}
				else {
					console.log("Valid input!");
					let pageRange = { start: StartPage, end: EndPage };
					return pageRange;
				}
			}
			else {
				alert("Invalid input!\nPlease enter a single page number or a range of whole numbers only.");
			}
		}
	}
}

/* Function to get a Valid RegEx Input from user

Returns: null if the user cancels the input or the regex is invalid || The valid user input as RegExp object
*/
function getValidRegExp() {
	let isInputValid = false;
	let validRegExp = null;
	let inputErr = "Invalid Input. Please enter a valid JavaScript Regular Expression syntax.";
	while (!isInputValid) {
		let userRegExp = prompt("Please enter the Regular Expression for grep search, in the following format:\n/pattern/modifiers (e.g. to search all numbers, type: /\\b\\d+\\b/g\nRead more here: http://bit.ly/js_regex", "");
		if (userRegExp === null) {
			console.log("User Cancelled Input.");
			isInputValid = 1; //Assume cancellation to be valid input
			validRegExp = null;
		}
		else {
			if (userRegExp != "") {
				userRegExp = userRegExp.trim();
				let inputs = userRegExp.split("\/"); //Split the Pattern and the Flags

				if (inputs.length == 3) {//User provided both Pattern and Flags
					regExpPattern = inputs[1];
					regExpFlags = inputs[2];
					isInputValid = true;
				}
				else if (inputs.length == 2) {//User provided ONLY Pattern and NO Flags
					regExpPattern = inputs[1];
					regExpFlags = ""; //Set Empty
					isInputValid = true;
				}
				else {//Incorrect RegEx Syntax
					console.log(inputErr);
					alert(inputErr);
					isInputValid = false;
				}

				//Only create RegEx if the Input is valid
				if (isInputValid) {
					console.log("RegExp Pattern: " + regExpPattern + ", RegExp Flags: " + regExpFlags);
					//Check if the String can be converted to a RegExp
					validRegExp = strToRegExp(regExpPattern, regExpFlags);
					if (validRegExp == null) {
						isInputValid = false;
					}
				}
			}
			else {
				console.log("Empty Input.");
				alert(inputErr);
				isInputValid = false;
			}
		}
	}
	return validRegExp;
}

//Function to Convert a String to a JS RegExp object. Returns null if the RegEx is invalid
function strToRegExp(strRegExp, strFlags) {
	let newRegExp;
	try {
		newRegExp = new RegExp(strRegExp, strFlags);
	} catch (e) {
		alert(e.toString());
		newRegExp = null;
	}
	return newRegExp;
}


/* Function to get a Valid Asset name for a Provided Asset Type
Asks for an Asset name from the user, showing the string message sent as promptString
Returns the Asset Name in the correct case, if the asset entered by the user exists.
Returns "null" if the user cancels the input
*/
function getValidAssetName(assetType, promptString, defaultValue) {
	let allAssetNames = getAssetNamesAsArray(assetType);
	let boolShowListInPrompt = false; //The list might be too long to show
	let boolIsCaseSensitive = false;  //Ignore case

	console.log("Prompt user for Asset Name of type: " + assetType);
	return getValidInputFromList(allAssetNames, promptString, defaultValue, boolShowListInPrompt, boolIsCaseSensitive);
}

/* Function to get a Asset name as an array
Returns: An array with names of asset type provided
*/
function getAssetNamesAsArray(assetType) {
	let activeProject = app.activeProject();
	let allAssets = activeProject.getAssets(assetType);
	let allAssetNames = [];

	//Iterate through the list to get names
	for (let n = 0; n < allAssets.length; n++) {
		allAssetNames[n] = allAssets[n].name; //Get the name in correct case, we converted the original input to lower case		
	}

	return allAssetNames;
}

/* Function to check if an Asset Name Exists
Returns the Asset Name in the correct case, if the asset exists. The assetNameToFind variable can be sent in any case
Returns: "null" if assetNameToFind does not Exist
*/
function doesAssetNameExist(assetNameToFind, assetType, boolIsCaseSensitive) {

	let allAssetNames = getAssetNamesAsArray(assetType);
	let itemIndex = findItemIndexInArray(assetNameToFind, allAssetNames, boolIsCaseSensitive);
	let assetNameFound = null;

	if (itemIndex >= 0) {
		assetNameFound = allAssetNames[itemIndex]; //Get the name in correct case as per Layout
		console.log("Asset Name '" + assetNameToFind + "' of type " + assetType + " found at index " + itemIndex + "! Valid Name: " + assetNameFound);
	}
	return assetNameFound;
}