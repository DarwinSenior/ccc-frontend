var calendarData={
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
					aspectRatio: 1.457,
					columnFormat: {
						week: 'ddd'
					},
					defaultDate: "2015-01-20",
					//eventRender: function(event, element) { 
					//    element.find('.fc-time').remove();
					//}
				}
var colors = [	["#8DFF35", "#6ABF28", "#23400D"], 	//GREEN
				["#FFCC63", "#BF994A", "#403319"], 	//ORANGE
				["#FF4242", "#BF3131", "#401010"],	//RED
				["#5831E8", "#4024A8", "#281668"],	//BLUE
				["#4BFFF0", "#38BFB4", "#13403C"] ]	//TEAL
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
			    return null;
			};

			var calendarParsing = function(time, column_date){
					var s = time.split(' - ')[0];																			
					var e = time.split(' - ')[1];
					
					var s_hour = s.substring(0, s.indexOf(':'));
					var e_hour = e.substring(0, e.indexOf(':'));
					var s_min = s.substring(s.indexOf(':') + 1, s.indexOf(' '));
					var e_min = e.substring(e.indexOf(':') + 1, e.indexOf(' '));

				    var startTime = column_date.hour(Number(s_hour) + ((s.indexOf('p') > -1 && s_hour != 12)?12:0)).minute(s_min).format();
				    var endTime = column_date.hour(Number(e_hour) + ((e.indexOf('p') > -1 && e_hour != 12)?12:0)).minute(e_min).format();
				    var data = {}
				    data.startTime = startTime.substring(0, startTime.length - 6);
				    data.endTime = endTime.substring(0, endTime.length - 6);
				    return data;
			}

			var courses = {};

			$(document).ready(function() {
			   	$("#navbar").load("component_files/navbar.html");
			   	createCalendar();

			   	$("input[type='checkbox']").change(function() {
			   		var eventData = {}
			   		eventData.courseName = $(this).attr('id').split('-')[0];
			   		eventData.courseNum = $(this).attr('id').split('-')[1];
				    eventData.eventID = parseInt($(this).attr('id').split('-')[2]);

			        eventData.section = $(this).closest("tr").find("td:nth-child(3)").text();
			        eventData.days = $(this).closest("tr").find("td:nth-child(5)").text();
			        eventData.time = $(this).closest("tr").find("td:nth-child(6)").text();
			        eventData.date = $(this).closest("tr").find("td:nth-child(11)").text();
			        eventData.loc = $(this).closest("tr").find("td:nth-child(12)").text();



				    if(this.checked) {
				        $('#calendar').fullCalendar('addEventSource', function(start, end, timezone, callback) {
							var events = [];
							var daysOfWeek = "MTWRFSU";
					        var one_day = (24 * 60 * 60 * 1000);
					        

					        //FIX THIS LOOP TO RENDER EVENTS BASED ON DATA FROM THE TABLE
					        for (loop = start.valueOf(); loop <= end.valueOf(); loop = loop + one_day) {
					        	var column_date = new moment(loop);
					            var splitStartDate = date.split('-')[0];
					        	var splitEndDate = date.split('-')[1];
					            var startDate = new moment( {year: 2015, month: parseInt(splitStartDate.split('/')[0]) - 1, day: parseInt(splitStartDate.split('/')[1]) } );
					            var endDate = new moment( {year: 2015, month: parseInt(splitEndDate.split('/')[0]) - 1, day: parseInt(splitEndDate.split('/')[1]) } );

					            //check if current class is scheduled for the current day and if the day is within the start and end date of the class
					            if (days.indexOf(daysOfWeek.charAt(column_date.isoWeekday() - 1)) > -1 && column_date.isBefore(endDate) && column_date.isAfter(startDate)) {
					            	var timeData = calendarParsing(eventData.time, column_date);
					            	var startTime = timeData.startTime;
					            	var endTime = timeData.endTime;

					                if(courseName in courses) {	//check if course exists in our list
					                	if(courses[courseName].indexOf(courseNum) == -1) {	//check if class is not in list
					                		courses[courseName].push(courseNum);	//add the courseNum element to the course's courseName array
					                		courses[courseName][courseNum] = 1;	//set the section count in the courseNum to 1
			        						console.log(courseNum + " sections: " + courses[courseName][courseNum]);
					                	}
					                	else {
					                		courses[courseName][courseNum] += 1;	//just add one to the section count in the already-existing courseNum array
					                	}
					                }
					                else {	//new courseName new courseNum new section array					                	
					                	courses[courseName] = [courseNum];
					                	courses[courseName][courseNum] = 1;
					                }
					                //console.log(colors[getObjectKeyIndex(courses, courseName)][courses[courseName].indexOf(courseNum)]);

					                events.push({
					                    title: courseName + " " + courseNum + " " + section,
					                    start: startTime,
					                    end: endTime,
					                    allDay: false,
					                    id: eventID,
					                    color: colors[getObjectKeyIndex(courses, courseName)][courses[courseName].indexOf(courseNum)]
					                });
					            }
					        }

					        callback(events);
						});
				    }
				    else {
				    	$('#calendar').fullCalendar('removeEvents', eventID);

				    	courses[courseName][courseNum] -= 1;
				    	console.log("1 section deleted");

				    	if(courses[courseName][courseNum] == 0) {
				    		console.log(courseNum + " deleted");
				    		if(courses[courseName].length > 1) {
				    			courses[courseName].splice(courses[courseName].indexOf(courseNum), 1);
				    		}
				    		else {
				    			courses[courseName] = [];
				    		}
				    	}
				    	if(courses[courseName].length == 100) {
				    		console.log(courseName + " deleted");
				    		delete courses[courseName];
				    	}
				    }
				    
				});
			 });