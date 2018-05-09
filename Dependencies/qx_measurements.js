
//This function gets a valid numeric value with units(user entered or current units)
function getNumInputWithUnits(inputString, defVal, currUnits, minValue, maxValue, toTrim) {
	let flag = 0;
	while (flag == 0) {
		let input = prompt(inputString, defVal);
		if (input == null) {
			return null;
		}
		else {
			if (toTrim) {
				input = input.trim();
			}
			if (!currUnits) {
				let currUnits = getCurrentHorizontalUnits();
			}
			input = setUnits(input, currUnits);
			if (!isValidUnit(getUnits(input))) {
				alert("Please enter valid measurement units!");
			}
			else {
				if (minValue && maxValue) {
					minValue = convertAnyUnitToPoints(setUnits(minValue.toString(), currUnits));
					maxValue = convertAnyUnitToPoints(setUnits(maxValue.toString(), currUnits));

					console.log("Values in points:\nInput value: " + convertAnyUnitToPoints(input) + "\nMin Value: " + minValue + "\nMax value: " + maxValue);
					if (convertAnyUnitToPoints(input) < minValue || convertAnyUnitToPoints(input) > maxValue) {
						alert("Value can be between " + convertPointsToAnyUnit(minValue, getUnits(input)) + " and " + convertPointsToAnyUnit(maxValue, getUnits(input)) + " only");
					}
					else {
						return input;
					}
				}
				else {
					return input;
				}
			}
		}
	}
}

//gets the current horizontal measurement units of the layout
function getCurrentHorizontalUnits() {
	let layoutDims = app.activeLayout().getPrintLayoutOptions();
	if (layoutDims == null || layoutDims == "") {
		let currentHorizontalUnits = "px";//Default value for digital layouts
		console.log("Could not find current horizontal measurement units. Assuming it as pixels");
	}
	else {
		let currentHorizontalUnits = getUnits(layoutDims.pageWidth);
	}
	console.log("Current Horizontal Units: " + currentHorizontalUnits);
	return currentHorizontalUnits;
}

//gets the current vertical measurement units of the layout
function getCurrentVerticalUnits() {
	let layoutDims = app.activeLayout().getPrintLayoutOptions();
	if (layoutDims == null || layoutDims == "") {
		let currentVerticalUnits = "px";//Default value for digital layouts
		console.log("Could not find current vertical measurement units. Assuming it as pixels");
	}
	else {
		let currentVerticalUnits = getUnits(layoutDims.pageHeight);
	}
	console.log("Current Vertical Units: " + currentVerticalUnits);
	return currentVerticalUnits;
}

//This function sets the default units to the value if the value contains no units
function setUnits(value, currUnits) {
	if (getUnits(value).trim() == '') {
		value = value + currUnits;
		console.log("Added units: " + currUnits + "to value: " + value);
	}
	return value;
}

//This function returns the measurement units of the quantity entered
function getUnits(number) {
	return number.replace(/[0-9.-]/g, '').trim();
}

//function checks if the unit is compatible with XPress
function isValidUnit(unit) {
	unit = unit.trim();
	let validUnits = ["in", "p", "pt", "mm", "cm", "c", "ag", "px"];
	if (validUnits.indexOf(unit) >= 0)
		return true;
	else
		return false;
}

//function to check if a given number is integer
function isInt(n) {
	return Number(n) == n && n % 1 === 0;
}

//converts the measurement value to points measurement
function convertPointsToAnyUnit(n, targetUnit) {
	n = parseFloat(n);
	let result;
	targetUnit = targetUnit.trim();
	switch (targetUnit) {
		case "in":
			result = roundOff((n / 72), 1000) + targetUnit;
			break;
		case "pt":
		case "px":
			result = n + targetUnit;
			break;
		case "mm":
			result = roundOff((n / 2.835), 1000) + targetUnit;
			break;
		case "cm":
			result = roundOff((n / 28.35), 1000) + targetUnit;
			break;
		case "ag":
			result = roundOff((n / 5.143), 1000) + targetUnit;
			break;
		case "p":
			result = convertPointsToPicas(n);
			break;
		case "c":
			result = convertPointsToCiceros(n);
			break;
	}
	console.log("Converted " + n + "pt to " + result);
	return result;
}

function convertPointsToPicas(n) {
	let x = n;
	let y = roundOff((x % 12), 1000);
	x = parseInt(x / 12);
	result = x + "p" + y;
	return result;
}

function convertPointsToCiceros(n) {
	let x = n * 0.93;
	let y = roundOff((x % 12), 1000);
	x = parseInt(x / 12);
	result = x + "c" + y;
	return result;
}

//converts the measurement value to points measurement
function convertAnyUnitToPoints(n) {
	let x = parseFloat(n);
	let result = n;
	let srcUnits = getUnits(n);
	srcUnits = srcUnits.trim();
	switch (srcUnits) {
		case "in":
			result = (x * 72);
			break;
		case "pt":
		case "px":
			result = x;
			break;
		case "mm":
			result = (x * 2.835);
			break;
		case "cm":
			result = (x * 28.35);
			break;
		case "ag":
			result = (x * 5.143);
			break;
		case "p":
			result = convertPicasToPoints(n);
			break;
		case "c":
			result = convertCicerosToPoints(n);
			break;
	}
	result = roundOff(result, 1000);
	console.log("Converted " + n + " to " + result + "pt");
	return result;
}

//converts the measurement value between two unites
function convertBetweenUnits(n, sourceUnit, targetUnit) {
	let convertedNumber;
	//First change to Points
	convertedNumber = convertAnyUnitToPoints(n + sourceUnit);
	//Now change from Points to the Target Unit
	convertedNumber = convertPointsToAnyUnit(convertedNumber, targetUnit);
	return parseFloat(convertedNumber);
}

//This function converts measurements in picas to points
function convertPicasToPoints(n) {
	let x = parseFloat(n);
	let y = parseFloat(n.substring(n.search("p") + 1, n.length));
	if (isNaN(y))
		result = (x * 12);
	else if (isNaN(x))
		result = y;
	else
		result = ((x * 12) + y);
	return roundOff(result, 1000);
}

//This function converts measurements in ciceros to points
function convertCicerosToPoints(n) {
	let x = parseFloat(n);
	let y = parseFloat(n.substring(n.search("c") + 1, n.length));
	if (isNaN(y))
		result = (x * 12.917);
	else if (isNaN(x))
		result = (y * 1.074);
	else
		result = ((x * 12.917) + (y * 1.074));
	return roundOff(result, 1000);
}

//rounds off the values to required precision
function roundOff(num, precision) {
	x = (num * precision * 10) % 10;
	if (x >= 5)
		return ((parseInt(num * precision)) + 1) / precision;
	else
		return (parseInt(num * precision)) / precision;
}

//function to calculate the width of the box in pts
function getBoxWidthInPts(box) {
	return roundOff((convertAnyUnitToPoints(box.style.qxRight)) - (convertAnyUnitToPoints(box.style.qxLeft)), 1000);
}

//function to calculate the height of the box in pts
function getBoxHeightInPts(box) {
	return roundOff((convertAnyUnitToPoints(box.style.qxBottom)) - (convertAnyUnitToPoints(box.style.qxTop)), 1000);
}

//function to calculate the text box inset in pts
function getBoxInsetsInPts(box) {
	let leftInset = 0, rightInset = 0, topInset = 0, bottomInset = 0, boxInsets;
	if (box.style.qxPadding == "")//if multiple insets are applied
	{
		leftInset = roundOff(convertAnyUnitToPoints(box.style.qxPaddingLeft), 1000);
		rightInset = roundOff(convertAnyUnitToPoints(box.style.qxPaddingRight), 1000);
		topInset = roundOff(convertAnyUnitToPoints(box.style.qxPaddingTop), 1000);
		bottomInset = roundOff(convertAnyUnitToPoints(box.style.qxPaddingBottom), 1000);
	}
	else {
		leftInset = roundOff(convertAnyUnitToPoints(box.style.qxPadding), 1000);
		rightInset = roundOff(convertAnyUnitToPoints(box.style.qxPadding), 1000);
		topInset = roundOff(convertAnyUnitToPoints(box.style.qxPadding), 1000);
		bottomInset = roundOff(convertAnyUnitToPoints(box.style.qxPadding), 1000);
	}
	boxInsets = { top: topInset, bottom: bottomInset, left: leftInset, right: rightInset };
	return boxInsets;
}

//function to get the width of border applied on the box in pts
function getBoxBorderWidthInPts(box) {
	return roundOff(convertAnyUnitToPoints(box.style.qxBorderWidth), 1000);
}