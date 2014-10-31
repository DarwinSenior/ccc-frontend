var calendarData = {
	header: {
		left: '',
		center: '',
		right: ''
	},
    weekends: false,
    defaultView: 'agendaWeek',
    minTime: '08:00:00',
    maxTime: '22:00:00',
    slotDuration: '00:30:00',
    allDaySlot: false,
	editable: false,
	aspectRatio: 1.455,
	columnFormat: {
		week: 'ddd'
	},
	//eventRender: function(event, element) { 
	//    element.find('.fc-time').remove();
	//}
};

var setDefaultDate = function(date) {
	calendarData.defaultDate = date;
}

var colors = [	["#2BE800", "#AAEC9B", "#22B500", "#316824"], 	//GREEN
				["#FFC20D", "#FFECB5", "#CC9B0A", "#7F6C32"], 	//ORANGE
				["#E81B00", "#ECA59B", "#B51500", "#680C00"],	//RED
				["#7200FF", "#CFA8FF", "#512C7F", "#39007F"],	//PURPLE
				["#00CCFF", "#A8EEFF", "#2C6F7F", "#00667F"] ]	//TEAL

var createCalendar = function() {
	$('#calendar').fullCalendar(calendarData);
};

var getObjectKeyIndex = function(obj, keyToFind) {
    var i = 0, key;
    for (key in obj) {
        if (key == keyToFind) {
            return i;
        }
        i++;
    }
    return -1;
};

var calendarParsing = function(time, column_date) {
		var s = time.split(' - ')[0];																			
		var e = time.split(' - ')[1];
		
		var s_hour = s.substring(0, s.indexOf(':'));
		var e_hour = e.substring(0, e.indexOf(':'));
		var s_min = s.substring(s.indexOf(':') + 1, s.indexOf(' '));
		var e_min = e.substring(e.indexOf(':') + 1, e.indexOf(' '));

	    var startTime = column_date.hour(Number(s_hour) + ((s.indexOf('p') > -1 && s_hour != 12)?12:0)).minute(s_min).format();
	    var endTime = column_date.hour(Number(e_hour) + ((e.indexOf('p') > -1 && e_hour != 12)?12:0)).minute(e_min).format();
	    var data = {};
	    data.startTime = startTime.substring(0, startTime.length - 6);
	    data.endTime = endTime.substring(0, endTime.length - 6);
	    return data;
};

var printObj = function(obj) {
	for(course in obj) {
		console.log(course + ": " + obj[course]);
	}
}

var getPropIndexInObjectArray = function(array, property) {
    for(i = 0; i < array.length; i++) {
		if(array[i].hasOwnProperty(property)) {
			return i;
		}
	}
	return -1;
};

var courses = {};

$(document).ready(function() {
   	$("#navbar").load("component_files/navbar.html");
   	createCalendar();

   	$("input[type='checkbox']").change(function() {
   		var tableData = {};
   		tableData.courseName = $(this).attr('id').split('-')[0];
   		tableData.courseNum = $(this).attr('id').split('-')[1];
	    tableData.eventID = parseInt($(this).attr('id').split('-')[2]);

        tableData.section = $(this).closest("tr").find("td:nth-child(3)").text();
        tableData.days = $(this).closest("tr").find("td:nth-child(5)").text();
        tableData.time = $(this).closest("tr").find("td:nth-child(6)").text();
        tableData.date = $(this).closest("tr").find("td:nth-child(11)").text();
        tableData.loc = $(this).closest("tr").find("td:nth-child(12)").text();

	    if(this.checked) {
	        $('#calendar').fullCalendar('addEventSource', function(start, end, timezone, callback) {
				var events = [];
				var daysOfWeek = "MTWRFSU";
		        var one_day = (24 * 60 * 60 * 1000);
		        
		        for (loop = start.valueOf(); loop <= end.valueOf(); loop = loop + one_day) {
		        	var column_date = new moment(loop);
		            var splitStartDate = tableData.date.split('-')[0];
		        	var splitEndDate = tableData.date.split('-')[1];
		            var startDate = new moment( {year: 2015, month: parseInt(splitStartDate.split('/')[0]) - 1, day: parseInt(splitStartDate.split('/')[1]) } );
		            var endDate = new moment( {year: 2015, month: parseInt(splitEndDate.split('/')[0]) - 1, day: parseInt(splitEndDate.split('/')[1]) } );

		            //check if current class is scheduled for the current day and if the day is within the start and end date of the class
		            if (tableData.days.indexOf(daysOfWeek.charAt(column_date.isoWeekday() - 1)) > -1 && column_date.isBefore(endDate) && column_date.isAfter(startDate)) {
		            	var timeData = calendarParsing(tableData.time, column_date);

		            	var startTime = timeData.startTime;
		            	var endTime = timeData.endTime;

		                if(tableData.courseName in courses) {	//check if courseName exists in our list
		                	if(getPropIndexInObjectArray(courses[tableData.courseName], tableData.courseNum) === -1) {	//check if there is NO courseNum object in the courseName array
		                		var obj = {};
		                		obj[tableData.courseNum] = 1;
		                		courses[tableData.courseName].push(obj);	//add the courseNum object to the course's courseName array

		                		console.log(tableData.courseNum + " added!");
		                	}
		                	else {	//just add one to the section count in the already-existing courseNum object
		                		courses[tableData.courseName][getPropIndexInObjectArray(courses[tableData.courseName], tableData.courseNum)][tableData.courseNum] += 1;
		                	}
		                }
		                else {	//new courseName array with a new courseNum object with section count initialized to 1
		                	var obj = {};
		                	obj[tableData.courseNum] = 1;
		                	courses[tableData.courseName] = [obj];
		                }

		                events.push({
		                    title: tableData.courseName + " " + tableData.courseNum + " " + tableData.section,
		                    start: startTime,
		                    end: endTime,
		                    allDay: false,
		                    id: tableData.eventID,
		                    color: colors[getObjectKeyIndex(courses, tableData.courseName)][getPropIndexInObjectArray(courses[tableData.courseName], tableData.courseNum)]
		                });
		            }
		        }

		        callback(events);
			});
	    }
	    else {
	    	$('#calendar').fullCalendar('removeEvents', function(event) {
	    		if(event.id == tableData.eventID) {	//decrement section count for each instance of an event removed -> appropriately accounts for repeating events
			    	courses[tableData.courseName][getPropIndexInObjectArray(courses[tableData.courseName], tableData.courseNum)][tableData.courseNum] -= 1;
			    	console.log("event from " + tableData.courseName + " " + tableData.courseNum + " removed");
			    	return true;
			    }
	    	});

	    	//check if the section count for a particular courseNum object drops to 0
	    	if(courses[tableData.courseName][getPropIndexInObjectArray(courses[tableData.courseName], tableData.courseNum)][tableData.courseNum] === 0) {
	    		console.log("number of elements before removal: " + courses[tableData.courseName].length);
	    		if(courses[tableData.courseName].length > 1) {	//if there are other objects in the array than the one with 0, splice the object out of the array
	    			
	    			courses[tableData.courseName].splice(getPropIndexInObjectArray(courses[tableData.courseName], tableData.courseNum), 1);
	    			console.log(tableData.courseNum + " deleted with " + courses[tableData.courseName].length + " elements remaining");
	    		}
	    		else {	//if this is the only object, turn the array into an empty array
	    			console.log(tableData.courseNum + " deleted with no more elements remaining");
	    			courses[tableData.courseName] = [];
	    			console.log(courses[tableData.courseName].length);
	    		}
	    	}
	    	//if there are no more objects in the array, delete the array from the overall courses object
	    	if(courses[tableData.courseName].length == 0) {
	    		console.log(tableData.courseName + " deleted");
	    		delete courses[tableData.courseName];
	    	}
	    }

	    console.log(courses);
	});
});