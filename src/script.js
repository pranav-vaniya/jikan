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

var headings = [];
var data = [];

$(document).ready(function () {
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
	filenameField.html(file.name);

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
		fillTable(dataTable, headings, data);
	};

	reader.readAsArrayBuffer(file);
});

exportFileButton.on("click", function () {
	let wb = XLSX.utils.book_new();
	let ws = XLSX.utils.aoa_to_sheet(data);
	XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
	XLSX.writeFile(wb, filenameField.html());
});

