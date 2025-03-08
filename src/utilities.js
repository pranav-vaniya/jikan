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
			tbodyHtml += "<td>" + data[i][j] + "</td>";
		}
		tbodyHtml += "</tr>";
	}

	tbodyHtml += "</tbody";
	dataTable.append(tbodyHtml);
}

