var createCalendar = function() {
	$('#week-display').fullCalendar({
		header: {
			left: '',
			center: 'title',
			right: ''
		},
	    weekends: false,
	    defaultView: 'agendaWeek',
	    minTime: '08:00:00',
	    maxTime: '22:00:00',
	    slotDuration: '00:15:00',
	    allDaySlot: false,
		editable: false,
		aspectRatio: 1.505,
		columnFormat: {
			week: 'ddd MM/DD'
		},
	});
};

var getObjectKeyIndex = function(obj, keyToFind) {
    var i = 0, key;
    for (key in obj) {
        if (key == keyToFind) {
            return i;
        }
        i++;
    }
    return null;
};

//render the weekly view
var generateSchedule = function(data) {
	$('#week-display').fullCalendar( 'addEventSource', function(start, end, timezone, callback) {
	    var events = [];
	    var daysOfWeek = "MTWRFSU";
	    var months = {"Jan":0, "Feb":1, "Mar":2, "Apr":3, "May":4, "Jun":5, "Jul":6, "Aug":7, "Sep":8, "Oct":9, "Nov":10, "Dec":11};
	    var one_day = (24 * 60 * 60 * 1000);
	    var colors = [	["#2BE800", "#AAEC9B", "#22B500", "#316824"], 	//GREEN
	    				["#FFC20D", "#FFECB5", "#CC9B0A", "#7F6C32"], 	//ORANGE
	    				["#E81B00", "#ECA59B", "#B51500", "#680C00"],	//RED
	    				["#7200FF", "#CFA8FF", "#512C7F", "#39007F"],	//PURPLE
	    				["#00CCFF", "#A8EEFF", "#2C6F7F", "#00667F"] ]	//TEAL

	    var sched = {};

		$.each(data["Schedule"], function(i, element) {	//go through each class in the array
	        for (loop = start.valueOf(); loop <= end.valueOf(); loop = loop + one_day) {
	            var column_date = new moment(loop);
	            var splitEndDate = data["Schedule"][i].End.split(' ');
	            var splitStartDate = data["Schedule"][i].Start.split(' ');
	            var endDate = new moment( {year: splitEndDate[2], month: months[splitEndDate[0]], day: splitEndDate[1].substring(0, splitEndDate[1].indexOf(','))} );
	            var startDate = new moment( {year: splitStartDate[2], month: months[splitStartDate[0]], day: splitStartDate[1].substring(0, splitStartDate[1].indexOf(','))} );

	            //check if current class is scheduled for the current day and if the day is within the start and end date of the class
	            if (data["Schedule"][i].Days.indexOf(daysOfWeek.charAt(column_date.isoWeekday() - 1)) > -1 && column_date.isBefore(endDate) && column_date.isAfter(startDate)) {
	            	var s = data["Schedule"][i].Time.split(" - ")[0];																			
	            	var e = data["Schedule"][i].Time.split(" - ")[1];
	            	
	            	var s_hour = s.substring(0, s.indexOf(':'));
	            	var e_hour = e.substring(0, e.indexOf(':'));
	            	var s_min = s.substring(s.indexOf(':') + 1, s.indexOf(' '));
	            	var e_min = e.substring(e.indexOf(':') + 1, e.indexOf(' '));

	                var startTime = column_date.hour(Number(s_hour) + ((s.indexOf('p') > -1 && s_hour != 12)?12:0)).minute(s_min).format();
	                var endTime = column_date.hour(Number(e_hour) + ((e.indexOf('p') > -1 && e_hour != 12)?12:0)).minute(e_min).format();
	                startTime = startTime.substring(0, startTime.length - 6);
	                endTime = endTime.substring(0, endTime.length - 6);

	                if(data["Schedule"][i].Subject in sched)	//check if course exists in our list
	                {
	                	if(sched[data["Schedule"][i].Subject].indexOf(data["Schedule"][i].Course) == -1) {	//check if class is not in list
	                		sched[data["Schedule"][i].Subject].push(data["Schedule"][i].Course);	//add the class to the course's class array
	                	}
	                }
	                else	//new course new class array
	                {
	                	sched[data["Schedule"][i].Subject] = [data["Schedule"][i].Course];
	                }

	                events.push({
	                    title: data["Schedule"][i].Subject + " " + data["Schedule"][i].Course + " " + data["Schedule"][i].Section + "\n" + data["Schedule"][i].Location,
	                    start: startTime,
	                    end: endTime,
	                    allDay: false,
	                    color: colors[getObjectKeyIndex(sched, data["Schedule"][i].Subject)][sched[data["Schedule"][i].Subject].indexOf(data["Schedule"][i].Course)],
	                });
	        	}
	        }
		});

	    callback(events);
	});
};

//render the concise view
var generateConcise = function(data) {
	var output = "";
	var table = [];
	var newRow;

	$.each(data["Schedule"], function(i, element) {
		newRow = {"CRN": "",
				"Course": [],
				"Title": "",
				"Campus": "",
				"Credits": "",
				"Level": "",
				"Start": "",
				"End": "",
				"Days": "",
				"Time": "",
				"Location": "",
				"Instructor": ""};

		$.each(data["Schedule"][i], function(key, value) {
			if(key=="Subject") {
				newRow["Course"][0] = "<td>" + value;
			}
			else if(key=="Course") {
				newRow["Course"][1] = " " + value + " ";
			}
			else if(key=="Section") {
				newRow["Course"][2] = value + "</td>";
			}
			else {
				newRow[key] = "<td>" + value + "</td>";
			}
		});

		table.push(newRow);
	});

	for(i = 0; i < table.length; i++) {
		output += "<tr>"
		for(key in table[i]) {
			if(key=="Course")
				output += table[i][key][0] + table[i][key][1] + table[i][key][2];
			else
				output += table[i][key];
		}

		output += "</tr>";
	}
	document.getElementById("tableBody").innerHTML = output;
};	

$(document).ready(function() {
	$("#concise-display").hide();
	$("#detail-display").hide();
	createCalendar();
	generateSchedule(pulled);
	generateConcise(pulled);
	
   	$("#concise").click(function() {
   		$("#concise-display").show();
   		$("#detail-display").hide();
   		$("#week-display").hide();
   	});
   	$("#week").click(function() {
   		$("#concise-display").hide();
   		$("#detail-display").hide();
   		$("#week-display").show();
   		$("#week-display").fullCalendar('render');
   	});
   	$("#detail").click(function() {
   		$("#concise-display").hide();
   		$("#detail-display").show();
   		$("#week-display").hide();
   	});
});
