// some declarations
const dataTable = $("#data-table");
const searchBox = $("#search-input");
const clearSearchButton = $("#clear-search-button");
const importFileButton = $("#import-file-button");
const exportFileButton = $("#export-file-button");
const fileInput = $("#file-input");
const filenameField = $("#filename-field");
const emptyTableText = $("#empty-table-text");
const sheetSelect = $("#sheet-select");

var headings = [],
	allHeadings = {};
var data = [],
	allData = {};
var currentSheet = "",
	allSheets = [];
var rows = 0,
	cols = 0;

$(document).ready(function () {
	filenameField.val("");
	searchBox.val("");
	sheetSelect.hide();
});

searchBox.on("keypress", function (event) {
	if (event.key === "Enter") {
		let searchValue = searchBox.val();
		let searchResult = data.filter((row) =>
			row.some((cell) =>
				cell.toString().toLowerCase().includes(searchValue)
			)
		);

		fillTable(dataTable, headings, searchResult);
		searchBox.select();
	}
});

clearSearchButton.on("click", function () {
	fillTable(dataTable, headings, data);
	searchBox.val("");
	searchBox.focus();
});

importFileButton.on("click", function () {
	fileInput.click();
});

emptyTableText.on("click", function () {
	fileInput.click();
});

fileInput.on("change", function (event) {
	const file = event.target.files[0];

	if (!file) return;
	filenameField.val(file.name);

	const reader = new FileReader();
	reader.onload = function (e) {
		const uintData = new Uint8Array(e.target.result);
		const workbook = XLSX.read(uintData, { type: "array" });
		allSheets = [];

		for (let i = 0; i < workbook.SheetNames.length; i++) {
			var sheetName = workbook.SheetNames[i];
			var sheet = workbook.Sheets[sheetName];
			var rawArray = XLSX.utils.sheet_to_json(sheet, {
				header: 1,
				raw: true,
			});
			var maxColumns = Math.max(...rawArray.map((row) => row.length));
			var nestedArray = rawArray.map((row) =>
				Array.from({ length: maxColumns }, (_, i) =>
					row[i] !== undefined ? row[i] : ""
				)
			);

			if (nestedArray.length < 2) {
				alert("Less than two rows in the selected file.");
				return;
			}

			allHeadings[workbook.SheetNames[i]] = nestedArray[0];
			allData[workbook.SheetNames[i]] = nestedArray.slice(1);
			allSheets.push(sheetName);
		}

		currentSheet = workbook.SheetNames[0];
		headings = allHeadings[currentSheet];
		data = allData[currentSheet];
		rows = data.length;
		cols = data[0].length;
		emptyTableText.hide();
		fillTable(dataTable, headings, data);

		var sheetSelectHTML = "";
		for (let i = 0; i < workbook.SheetNames.length; i++) {
			if (i === 0) {
				sheetSelectHTML +=
					`<option value="` +
					workbook.SheetNames[i] +
					`" selected>` +
					workbook.SheetNames[i] +
					`</option>`;
			} else {
				sheetSelectHTML +=
					`<option value="` +
					workbook.SheetNames[i] +
					`">` +
					workbook.SheetNames[i] +
					`</option>`;
			}
		}
		sheetSelect.html(sheetSelectHTML);
		sheetSelect.show();
	};

	reader.readAsArrayBuffer(file);
});

exportFileButton.on("click", function () {
	allData[currentSheet] = data;

	if (data.length === 0) {
		return;
	}

	let wb = XLSX.utils.book_new();

	for (let i = 0; i < allSheets.length; i++) {
		let currentSheetName = allSheets[i];
		let currentSheetHeadings = [allHeadings[currentSheetName]];
		let currentSheetData = allData[currentSheetName];
		let allCurrentSheetData = [
			...currentSheetHeadings,
			...currentSheetData,
		];
		let ws = XLSX.utils.aoa_to_sheet(allCurrentSheetData);
		XLSX.utils.book_append_sheet(wb, ws, currentSheetName);
	}
	XLSX.writeFile(wb, filenameField.val());
});

sheetSelect.on("change", function () {
	allData[currentSheet] = data;

	currentSheet = sheetSelect.val();
	headings = allHeadings[currentSheet];
	data = allData[currentSheet];
	rows = data.length;
	cols = data[0].length;
	fillTable(dataTable, headings, data);
});

function handleTableValueChange(event, i, j) {
	data[i][j] = $("#tbody-cell-" + i + "-" + j).val();

	if (event.key === "Enter") {
		let new_i = i + 1,
			new_j = j;

		if (new_i === rows) {
			new_i = 0;
			new_j = j + 1;

			if (new_j === cols) {
				new_j = 0;
			}
		}

		let targetElement = $("#tbody-cell-" + new_i + "-" + new_j);
		let contentLength = targetElement.val().length * 2; // to ensure end
		targetElement.focus();
		targetElement[0].setSelectionRange(contentLength, contentLength);
	}

	if (event.key === "Tab") {
		let new_i = i,
			new_j = j + 1;

		if (new_j === cols) {
			new_j = 0;
			new_i = i + 1;

			if (new_i === rows) {
				new_i = 0;
			}
		}

		let targetElement = $("#tbody-cell-" + new_i + "-" + new_j);
		let contentLength = targetElement.val().length * 2; // to ensure end
		targetElement.focus();
		targetElement[0].setSelectionRange(contentLength, contentLength);
		event.preventDefault();
	}
}

function fillTable(dataTable, headings, data) {
	const headingsLength = headings.length;
	var theadHtml = "<thead><tr>";

	for (let i = 0; i < headings.length; i++) {
		theadHtml += "<th>" + headings[i] + "</th>";
	}

	theadHtml += "</tr></thead>";
	dataTable.html(theadHtml);

	if (data.length === 0) {
		return;
	}

	var rows = data.length,
		cols = data[0].length,
		i = 0,
		j = 0;
	var tbodyHtml = "<tbody>";

	for (i = 0; i < rows; i++) {
		if (data[i].length != headingsLength) {
			alert("Mismatched length of data.");
			return;
		}

		tbodyHtml += "<tr>";
		for (j = 0; j < cols; j++) {
			tbodyHtml +=
				`
				<td><input type="text" class="input-group border-0" size="1" id="tbody-cell-` +
				i +
				`-` +
				j +
				`" onkeydown="handleTableValueChange(event,` +
				i +
				`,` +
				j +
				`);" onblur="handleTableValueChange(event,` +
				i +
				`,` +
				j +
				`);" value=` +
				data[i][j] +
				`></td>
			`;
		}
		tbodyHtml += "</tr>";
	}

	tbodyHtml += "</tbody";
	dataTable.append(tbodyHtml);
}

