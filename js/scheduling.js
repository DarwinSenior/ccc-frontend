var findRowIndex = function(name) {
	var index = 0;
	var returnIndex;
	$("tr.course-list-row").each(function() {
		if($(this).find("td:nth-child(1)").text() === name) {
			returnIndex = index;
		}
		index++;
	});

	return (returnIndex>=0)?returnIndex:-1;
};

$(document).ready(function() {
	$("#navbar").load("component_files/navbar.html");
	$("#selection-warning").hide();
	$("#add-course-section").hide();

	var tableSize = 0;
	var creditTotal = 0;

    /*if(tableSize == 0) {
    	var att1 = document.createAttribute("data-toggle");
    	att1.value = "modal";
    	var att2 = document.createAttribute("data-target");
    	att2.value = "#warningModal";

		document.getElementsByClassName("btn-create-schedule")[0].setAttributeNode(att1);
		document.getElementsByClassName("btn-create-schedule")[0].setAttributeNode(att2);
		document.getElementsByClassName("btn-create-schedule")[1].setAttributeNode(att1);
		document.getElementsByClassName("btn-create-schedule")[1].setAttributeNode(att2);

		document.getElementsByClassName("btn-create-schedule")[0].removeAttribute("href");
		document.getElementsByClassName("btn-create-schedule")[0].removeAttribute("href");
    }*/

	$("input[type='checkbox']").change(function() {
		var tableData = {};

        tableData.courseTitle = $(this).closest("tr").find("td:nth-child(3)").text();
        tableData.credits = $(this).closest("tr").find("td:nth-child(4)").text();

        if(this.checked) {
	    	var table = document.getElementById("selected-courses-table");

		    var row = table.insertRow(tableSize);
		    row.className = "course-list-row";

		    var cell1 = row.insertCell(0);
		    var cell2 = row.insertCell(1);
		    cell1.innerHTML = tableData.courseTitle;
		    cell2.innerHTML = tableData.credits;

		    tableSize++;
		    creditTotal += parseInt(tableData.credits);
		    document.getElementById("credit-total").innerHTML = creditTotal.toFixed(3);
        }
        else {
        	document.getElementById("selected-courses-table").deleteRow(findRowIndex(tableData.courseTitle));
        	tableSize--;

        	creditTotal -= parseInt(tableData.credits);
		    document.getElementById("credit-total").innerHTML = creditTotal.toFixed(3);
        }

    	if(creditTotal > 18)
        	document.getElementById("credit-total").style.color = "red";
	    else
	    	document.getElementById("credit-total").style.color = "black";

	    if(tableSize == 0) {
	    	var manual_att = document.createAttribute("disabled");
	    	manual_att.value = "disabled";
	    	var auto_att = document.createAttribute("disabled");
	    	auto_att.value = "disabled";

	    	document.getElementById("manual-button").setAttributeNode(manual_att);
	    	document.getElementById("auto-button").setAttributeNode(auto_att);
	    }
		else {
			document.getElementById("manual-button").removeAttribute("disabled");
			document.getElementById("auto-button").removeAttribute("disabled");
		}
	});

	var selectedYear = "--", selectedTerm = "--";

	$("#year").change(function() {
		selectedYear = $("option:selected", this).text();
	});
	$("#term").change(function() {
		selectedTerm = $("option:selected", this).text();
	});

	$("#search-button").click(function() {
		if(selectedYear == "--" || selectedTerm == "--") {
			$("#selection-warning").show();
			$("#add-course-section").hide();
		}
		else {
			$("#selection-warning").hide();
			$("#add-course-section").show();
			document.getElementById("course-search-title").innerHTML = selectedTerm + " " + selectedYear + " Courses";
		}
	});

	//successfully gets text in search box after a key is pressed ->   implement filtering function once json is created
	$("#searchBar").data('val', $("#searchBar").val());
	$("#searchBar").change(function() {
		console.log("Search bar text: " + document.getElementById("searchBar").value);
	})

	$("#searchBar").keyup(function() {
		if($("#searchBar").val() != $("#searchBar").data('val')){ // check if value changed
            $("#searchBar").data('val',  $("#searchBar").val() ); // save new value
            $(this).change(); // simulate "change" event
        }
	});
});
