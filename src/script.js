// initialize tooltips

const tooltipTriggerList = document.querySelectorAll(
	'[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
	(tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);

// some declarations
const dataTable = $("#data-table");
const searchBox = $("#search-input");
const clearSearchButton = $("#clear-search-button");
const importFileButton = $("#import-file-button");
const exportFileButton = $("#export-file-button");
const fileInput = $("#file-input");
const filenameField = $("#filename-field");
const rerenderTableButton = $("#rerender-table-button");

var headings = [];
var data = [];
var rows = 0,
	cols = 0;

$(document).ready(function () {
	filenameField.val("");
	searchBox.val("");
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

fileInput.on("change", function (event) {
	const file = event.target.files[0];

	if (!file) return;
	filenameField.val(file.name);

	const reader = new FileReader();
	reader.onload = function (e) {
		const uintData = new Uint8Array(e.target.result);
		const workbook = XLSX.read(uintData, { type: "array" });
		const sheetName = workbook.SheetNames[0];
		const sheet = workbook.Sheets[sheetName];
		const rawArray = XLSX.utils.sheet_to_json(sheet, {
			header: 1,
			raw: true,
		});
		const maxColumns = Math.max(...rawArray.map((row) => row.length));
		const nestedArray = rawArray.map((row) =>
			Array.from({ length: maxColumns }, (_, i) =>
				row[i] !== undefined ? row[i] : ""
			)
		);

		if (nestedArray.length < 2) {
			alert("Less than two rows in the selected file.");
			return;
		}

		headings = nestedArray[0];
		data = nestedArray.slice(1);
		rows = data.length;
		cols = data[0].length;
		fillTable(dataTable, headings, data);
	};

	reader.readAsArrayBuffer(file);
});

exportFileButton.on("click", function () {
	let wb = XLSX.utils.book_new();
	let ws = XLSX.utils.aoa_to_sheet(data);
	XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
	XLSX.writeFile(wb, filenameField.val());
});

rerenderTableButton.on("click", function () {
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

