﻿//use strict

(function () {

    var FITUI;

    window.onload = function () {
        FITUI = new UIController();
        FITUI.setup();
    }

    function UIController() {

        this.map = undefined;

    }

    UIController.prototype.showSpeedVsHeartRate = function (rawData) {
        var seriesSpeedVsHR = [];
        var minLength;

        if (rawData["heart_rate"] === undefined || rawData["heart_rate"] === null)
            return;

        if (rawData["speed"] === undefined || rawData["speed"] === null)
            return;

        if (rawData["heart_rate"].length === 0)
            return;

        if (rawData["speed"].length === 0)
            return;

        var hrLength = rawData["heart_rate"].length;
        var speedLength = rawData["speed"].length;

        if (hrLength >= speedLength) // Arrays could be of different sizes, cut off
            minLength = speedLength;
        else
            minLengt = hrLength;


        var myZones = getHRZones();

        for (var datap = 0; datap < minLength; datap++) {
            var speedx = rawData["speed"][datap][1];
            var hry = rawData["heart_rate"][datap][1];
            if (speedx === undefined || hry === undefined)
                console.error("Could not access raw data for data point nr. " + datap.toString());
            else {
                seriesSpeedVsHR.push([speedx, hry]);

                // Count Heart rate data points in zone
                for (var zone = 0; zone < myZones.length; zone++) {
                    if (hry <= myZones[zone].max && hry >= myZones[zone].min)
                        if (myZones[zone].count === undefined)
                            myZones[zone].count = 1
                        else
                            myZones[zone].count++;
                }


            }
        }

        var divChart = document.getElementById("speedVsHRChart");
        divChart.style.visibility = "visible";

        var chart2 = new Highcharts.Chart({
            chart: {
                renderTo: 'speedVsHRChart',
                type: 'line'
            },
            title: {
                text: ''
            },
            xAxis: {

                //categories : ['Apples', 'Bananas', 'Oranges']
                //type : 'datetime'
            },
            yAxis: {
                title: {
                    text: 'bpm'
                }
            },

            series: [{ name: 'Speed vs Heart Rate', data: seriesSpeedVsHR }]

        });

    }

    function combine(values, timestamps) {
        var util = FITUtility();
        var combined = [];

        if (timestamps == undefined) {
            console.warn("Found no timestamps to combine with data measurements.");
            return values;
        }

        if (values.length !== timestamps.length)
            console.warn("Length of arrays to combine is not of same size; values length = " + values.length.toString() + " timestamp length = " + timestamps.length.toString());

        
        //if (verifyTimestamps(timestamps)) {
        values.forEach(function (element, index, array) {
            // combined.push([util.convertTimestampToLocalTime(timestamps[index]), element]);
            combined.push([util.addTimezoneOffsetToUTC(timestamps[index]), element]);
           // combined.push([timestamps[index], element]);
        });
        return combined;
        //} else
        //    return values;
    }

    function verifyTimestamps(timestamps) {
        var valid = true;
        var len = timestamps.length;

        for (var index = 0; index < len - 1; index++)
            if (timestamps[index + 1] < timestamps[index]) {
                valid = false;
                break;
            }

        return valid;
    }


    UIController.prototype.showChartsDatetime = function (rawData) {

        var util = FITUtility();
       

        var chartId = "testChart";
        var divChart = document.getElementById(chartId);
        divChart.style.visibility = "visible";
        var seriesSetup = [];

        var prevMarker = null; // Holds previous marker for tracking position during mouse move/over

        // Record data

        if (rawData.record !== undefined) {

            if (rawData.record["heart_rate"] !== undefined)
                seriesSetup.push({ name: 'Heart rate', data: combine(rawData.record["heart_rate"], rawData.record["timestamp"]), id: 'heartrateseries' })
            //if (rawData.record["altitude"] !== undefined)
            //    seriesSetup.push({ name: 'Altitude', data: 
            //        combine(rawData.record["altitude"], rawData.record["timestamp"]),
            //    });
            //if (rawData.record["cadence"] !== undefined)
            //    seriesSetup.push({ name: 'Cadence', data: combine(rawData.record["cadence"], rawData.record["timestamp"]) });
            //if (rawData.record["speed"] !== undefined) {
            //    rawData.record.speed.forEach(function (element, index, array) {
            //        array[index][0] = element[0] * 3.6;
            //    });
            //    seriesSetup.push({ name: 'Speed', data: combine(rawData.record["speed"], rawData.record["timestamp"]) });
            //}
        }

        //if (rawData.lap != undefined) {
        //    // Lap data
        //    if (rawData.lap["total_ascent"] !== undefined)
        //        seriesSetup.push({ name: 'Total Ascent pr Lap', data: rawData.lap["total_ascent"] });
        //    if (rawData.lap["total_descent"] !== undefined)
        //        seriesSetup.push({ name: 'Total Decent pr Lap', data: rawData.lap["total_descent"] });
        //    if (rawData.lap["avg_heart_rate"] !== undefined)
        //        seriesSetup.push({ name: 'Avg. HR pr Lap', data: rawData.lap["avg_heart_rate"] });
        //    if (rawData.lap["max_heart_rate"] !== undefined)
        //        seriesSetup.push({ name: 'Max. HR pr Lap', data: rawData.lap["max_heart_rate"] });
        //}



        //// Test flags

        //seriesSetup.push({
        //    type: 'flags',
        //    onSeries: 'heartrateseries',
        //    data: [{
        //        x: 0,
        //        text: 'First heart rate',
        //        title: 'I'
        //    }],
        //    width: 16,
        //    showInLegend: false
        //});

        var xAxisType = 'datetime'

        var chartOptions = {
            renderTo: chartId,
            type: 'line',
            // Allow zooming
            zoomType: 'xy'
            
    }
        //if (rawData.hrv !== undefined)
        //    chartOptions.inverted = true;

        var d = new Date();
        console.log("Starting highchart now " + d);

        chart1 = new Highcharts.Chart({
            chart: chartOptions,
            
            title: {
                text: ''
            },
            xAxis: {
                //categories : ['Apples', 'Bananas', 'Oranges']
                type: xAxisType
                //reversed : true
            },
            yAxis: {
                title: {
                    text: ''
                }
            },

            plotOptions: {
                series: {
                    allowPointSelect: true,
                    point: {

                        events: {

                            select: function () {
                                console.log(Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x), this.y)
                            },

                            mouseOver: function () {
                                var lat, long;

                                if (rawData.record != undefined) {
                                    
                                    var index = rawData.record.timestamp.indexOf(this.x-util.getTimezoneOffsetFromUTC());
                                    if (index === -1) {
                                        console.error("Could not find index of timestamp ", this.x);
                                        return;
                                    }

                                    setMarker = function () {
                                        prevMarker = new google.maps.Marker({
                                            position: new google.maps.LatLng(util.semiCirclesToDegrees(lat), util.semiCirclesToDegrees(long)),
                                            icon: {
                                                path: google.maps.SymbolPath.CIRCLE,
                                                scale: 3
                                            },
                                            draggable: true,
                                            map: FITUI.map
                                        });
                                    }

                                    if (rawData.record.position_lat != undefined)
                                        lat = rawData.record.position_lat[index];

                                    if (rawData.record.position_long != undefined)
                                        long = rawData.record.position_long[index];

                                    //console.log("Lat, long ", lat, long);

                                    if (prevMarker === null) {
                                        setMarker();
                                    } else {
                                        // Clear previous marker
                                        prevMarker.setMap(null);
                                        prevMarker = null;
                                        setMarker();
                                    }

                                    
                                }
                            },

                            mouseOut: function () {
                                if (prevMarker !== undefined || prevMarker !== null) {
                                    prevMarker.setMap(null);
                                    prevMarker = null; // GC takes over...
                                }
                            }
                        }

                    }
                }
            },

            series: seriesSetup



        }


            //, function () {
            ////callback action
            //alert('Something is happening now....');
    //    }
    );

        d = new Date();
        console.log("Finishing highcharts now " + d);


        //FITUI.showSpeedVsHeartRate(rawData);

        //FITUI.showHRZones(rawData);


    }

    UIController.prototype.showChartHrv = function (rawData) {
        var chartId = "hrvChart";
        var divChart = document.getElementById(chartId);
        //divChart.style.visibility = "visible";
        var seriesSetup = [];

        if (rawData.hrv !== undefined) {
            if (rawData.hrv.time !== undefined) {

                //chartType = 'bar';
                // Seems like line rendering is much faster than bar...
                //divChart.style.visibility = 'visible';
                divChart.style.display = 'block';
                seriesSetup.push({ name: 'Heart rate variability (RR-interval)', data: rawData.hrv.time })
            }

        }
        else {
            divChart.style.display = 'none';
            return;
        }

        var xAxisType = ''

        var chartOptions = {
            renderTo: chartId,
            type: 'line',
            // Allow zooming
            zoomType: 'xy'
        }


        chart1 = new Highcharts.Chart({
            chart: chartOptions,
            title: {
                text: 'Heart rate variability'
            },
            xAxis: {
                //categories : ['Apples', 'Bananas', 'Oranges']
                type: xAxisType,
                //reversed : true
                events: {
                    setExtremes: function (event) {
                        console.log("setExtremes xAxis ", event.min, event.max);
                    }
                }
            },
            yAxis: {
                title: {
                    text: ''
                },
                events: {
                    setExtremes: function (event) {
                        console.log("setExtremes yAxis ", event.min, event.max);
                    }
                }
            },

            series: seriesSetup

        });


    }

    UIController.prototype.showHRZones = function (rawData) {
        var divChart = document.getElementById("zonesChart");
        divChart.style.visibility = "visible";

        var options = {
            chart: {
                renderTo: 'zonesChart',
                type: 'bar'
            },
            title: {
                text: ''
            },
            xAxis: {

                //categories: [myZones[0].name, myZones[1].name, myZones[2].name, myZones[3].name, myZones[4].name]
                //type : 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Minutes'
                }
            }

            // Assuming 1 sec. sampling of data point -> divide by 60 to get number of minutes in zone
            //series: []
        };


        var myZones = getHRZones();

        for (var datap = 0; datap < rawData["heart_rate"].length; datap++) {

            var hry = rawData["heart_rate"][datap][1];
            if (hry == undefined || hry == null)
                console.error("Could not access raw data for data point nr. " + datap.toString());
            else {
                // Count Heart rate data points in zone
                for (var zone = 0; zone < myZones.length; zone++) {
                    if (hry <= myZones[zone].max && hry >= myZones[zone].min)
                        if (myZones[zone].count == undefined)
                            myZones[zone].count = 1
                        else
                            myZones[zone].count++;
                }
            }
        }

        var s1 = {};

        s1.name = "Heart rate zones";
        s1.data = [];
        options.xAxis.categories = [];
        options.series = [];

        for (var catNr = 0; catNr < myZones.length; catNr++) {
            options.xAxis.categories.push(myZones[catNr].name);
            s1.data.push([myZones[catNr].name + " (" + myZones[catNr].min.toString() + "-" + myZones[catNr].max.toString() + ")", myZones[catNr].count / 60]);
        }

        options.series.push(s1);

        var chart3 = new Highcharts.Chart(options);
    }

    //UIController.prototype.showFileInfo = function () { outConsole.innerHTML = '<p>File size: ' + FITUI.fitFileManager.fitFile.size.toString() + ' bytes, last modified: ' + FITUI.fitFileManager.fitFile.lastModifiedDate.toLocaleDateString() + '</p>'; }



    UIController.prototype.showSessionMarkers = function (map, rawdata) {
        // Plot markers for start of each session

        var util = FITUtility();

        var sessionStartPosFound = false;

        var session = rawdata.session;

        setMapCenter = function (sport,lat,long) {
            var latlong = new google.maps.LatLng(util.semiCirclesToDegrees(lat), util.semiCirclesToDegrees(long));
            map.setCenter(latlong);
            
            if (FITUI.sessionMarkers === undefined || FITUI.sessionMarkers === null)
                FITUI.sessionMarkers = [];

            var markerOptions = {
                position: latlong,
                map: map
            };

            // Select session marker according to sport mode
            var image = undefined;

            function newMarkerImage(imageName) {
                return new google.maps.MarkerImage(imageName,
                        new google.maps.Size(32, 32),
                        new google.maps.Point(0, 0),
                        new google.maps.Point(0, 32));
            }

            switch (sport) {
                case FITSport.running:
                    
                    image = newMarkerImage('Images/clicknrun.png');
                    break;
                case FITSport.cycling:
                    image = newMarkerImage('Images/bicycle_green_32.png');
                    break;

                case FITSport.swimming:
                    image = newMarkerImage('Images/blue-swimmer-icon-th.png');
                    break;
                    // TO DO : Add more icons
            }

            if (image !== undefined)
                markerOptions.icon = image;
           
            FITUI.sessionMarkers.push(new google.maps.Marker(markerOptions));
        }
        
        // Clear previous session markers
        if (FITUI.sessionMarkers !== undefined && FITUI.sessionMarkers !== null)
        {
            FITUI.sessionMarkers.forEach(function (element, index, array) {
                element.setMap(null);
            });

            FITUI.sessionMarkers = null;
        }

        if (session !== undefined)
       
            if (session.start_position_lat !== undefined)
            {
        

                session.start_position_lat.forEach(function (element, index, array) {

                    var lat = element;
                    var long = session.start_position_long[index];


                    //var startTimeDate = new Date();
                    //startTimeDate.setTime(util.convertTimestampToUTC(session.timestamp[index]));



                    if (lat !== undefined && long !== undefined) {
                        

                        sessionStartPosFound = true;
                        
                        setMapCenter(session.sport[index],lat,long);

                        
                    }
                });
            }


        // Valid .FIT file have session record, but invalid fit may not....try to fetch from record head instead

        if (!sessionStartPosFound)
            if (rawdata.record !== undefined) {
                var lat = undefined;

                if (rawdata.record.position_lat != undefined && rawdata.record.position_lat.length > 0)
                    lat = rawdata.record.position_lat[0];

                var long = undefined;

                if (rawdata.record.position_long != undefined && rawdata.record.position_long.length > 0)
                    long = rawdata.record.position_long[0];

                if (lat !== undefined && long !== undefined)
                    setMapCenter(lat, long);
            }


    }

    UIController.prototype.initMap = function () {

        var myCurrentPosition, newMap = undefined;

        var mapOptions = {

            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        newMap = new google.maps.Map(document.getElementById("activityMap"), mapOptions);

        var prevCenter = newMap.getCenter();

        if (navigator.geolocation) {
            // Async call with anonymous callback..
            navigator.geolocation.getCurrentPosition(function (position) {
                myCurrentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                currentCenter = newMap.getCenter();

                if (currentCenter === undefined)
                    newMap.setCenter(myCurrentPosition);
            });
        }

        return newMap;
    }

    UIController.prototype.showLaps = function (rawData) {


        FITUI.divSessionLap.show();

            
    }


    UIController.prototype.showPolyline = function (map, record) {

       
         // Clear previous polyline
            if (FITUI.activityPolyline !== undefined && FITUI.activityPolyline !== null) {
                
                FITUI.activityPolyline.setMap(null); 
                FITUI.activityPolyline = null;
            }

        // No need to render polyline if no position data is available
            if (record.position_lat === undefined || record.position_lat === null) 
              return;
        
        var activityCoordinates = [];
        var util = FITUtility();

        // Build up polyline
        
            var latLength = record.position_lat.length;
            console.info("Got GPS points (on property position_lat) : ", latLength);

        
            //var sampleInterval = Math.floor(latLength / 30);

            //if (sampleInterval < 1)
            //    sampleInterval = 1;

            var sampleInterval = 15; // Max. sampling rate for 910XT is 1 second 

            console.info("Sample length for polyline is ", sampleInterval);

            var sample = 0;
        
            record.position_lat.forEach(function (element, index, array) {
                if (sample === 0 || (sample++ % sampleInterval === 0) || index === latLength - 1) 
                    if (record.position_long[index] !== undefined)
                        activityCoordinates.push(new google.maps.LatLng(util.semiCirclesToDegrees(element), util.semiCirclesToDegrees(record.position_long[index])));
            })

        
        FITUI.activityPolyline = new google.maps.Polyline({
            path: activityCoordinates,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2
        });

        FITUI.activityPolyline.setMap(map);

    }


    UIController.prototype.onFITManagerMsg = function (e) {

        var eventdata = e.data;

        switch (eventdata.response) {

            case 'rawData':
                //var rawData = JSON.parse(data.rawdata);
                $("#progressFITimport").hide();
                FITUI.progressFITimportViewModel.progressFITimport(0);

                var rawData = eventdata.rawdata;

                if (FITUI.sessionViewModel === undefined) {
                    FITUI.sessionViewModel = ko.mapping.fromJS(rawData.session);
                    ko.applyBindings(FITUI.sessionViewModel, $('#divSessions')[0]);
                }
                else
                    ko.mapping.fromJS(rawData.session, FITUI.sessionViewModel);


                if (FITUI.lapViewModel === undefined) {
                    FITUI.lapViewModel = ko.mapping.fromJS(rawData.lap);
                    ko.applyBindings(FITUI.lapViewModel, $('#divLaps')[0]);
                }
                else
                    ko.mapping.fromJS(rawData.lap, FITUI.lapViewModel);

                // Initialize map
                if (FITUI.map === undefined)
                    FITUI.map = FITUI.initMap();


                switch (rawData.file_id.type[0]) {
                    case 4: // Activity file

                            FITUI.showLaps(rawData);

                        //if (rawData.session != undefined)
                            FITUI.showSessionMarkers(FITUI.map, rawData);

                        if (rawData.record != undefined)
                            FITUI.showPolyline(FITUI.map, rawData.record);

                        FITUI.showChartsDatetime(rawData);
                        FITUI.showChartHrv(rawData);

                        FITUI.showDataRecordsOnMap(eventdata.datamessages);
                        break;
                    default:
                        console.warn("Unsupported fit file type, expected 4 (activity file), but got ", rawData.file_id.type[0]);
                        break;

                }

              

                break;

            case 'header':
                var headerInfo = eventdata.header;
                if (headerInfo.estimatedFitFileSize != headerInfo.fitFile.size)
                    console.warn("Header reports FIT file size " + headerInfo.estimatedFitFileSize.toString() + " bytes, but file system reports: " + headerInfo.fitFile.size.toString() + " bytes.");
                break;

            case 'error':
                var errMsg = eventdata.data;

                if (eventdata.event != undefined) {
                    errMsg += " Event; ";
                    for (var prop in eventdata.event) {
                        if (typeof prop === "string")
                            errMsg += "property " + prop + " : " + eventdata.event.prop;
                    }
                }
                console.error(errMsg);
                break;

            case 'info':
                console.info(eventdata.data);
                break;

            case 'progress':
               
                FITUI.progressFITimportViewModel.progressFITimport(eventdata.data);

                //FITUI.progressFITImport.setAttribute("value", eventdata.data);
                break;

            default:
                console.error("Received unrecognized message from worker " + eventdata.response);
                break;
        }



    }

    UIController.prototype.onFITManagerError = function (e) {
        console.error("Error in worker, status " + e.toString());
    }

    function progressFITimportViewModel() {
        var self = this;

        self.progressFITimport = ko.observable(0);
    }

    function lapViewModel(lap) {
        var self = this;

        self.lap = lap;

        // Non-editable catalog data - would come from the server
        //self.availableMeals = [
        //    { mealName: "Standard (sandwich)", price: 0 },
        //    { mealName: "Premium (lobster)", price: 34.95 },
        //    { mealName: "Ultimate (whole zebra)", price: 290 }
        //];



        self.hasLap = ko.computed(function () {
            if (self.lap !== undefined)
                return true;
            else
                return false;
        });

    }

    function sessionViewModel(session) {
        var self = this;

        self.session = session;

        // Non-editable catalog data - would come from the server
        //self.availableMeals = [
        //    { mealName: "Standard (sandwich)", price: 0 },
        //    { mealName: "Premium (lobster)", price: 34.95 },
        //    { mealName: "Ultimate (whole zebra)", price: 290 }
        //];

       
        self.hasSession = ko.computed(function () {
            if (self.session !== undefined)
                return true;
            else
                return false;
        });



        //self.resetLapSession = function () {

        //    self.session = ko.observable(undefined);

        //    self.lap = ko.observable(undefined);

        //}

        //self.resetLapSession();

        ////self.rawDataAvailable = ko.observable(false);

        //self.sessionAvailable = ko.computed(function () {
        //    if (self.session === undefined)
        //        return false;
        //    else
        //        return true;
        //});

        //self.lapAvailable = ko.computed(function () {
        //    if (self.lap === undefined)
        //        return false;
        //    else
        //        return true;
        //});
        //self.lapTime = ko.computed(function () {
        //    var minRaw = self.lap.total_timer_time[0] / 60;
        //    var minPart = Math.floor(minRaw);
        //    var secPart = (minRaw - minPart) * 60;

        //    //return {
        //    //    minutes: minPart,
        //    //    seconds: secPart,
        //    //    toString: minPart.toString() + ":" + secPart.toFixed(2)
        //    //};

        //    return minPart.toString() + ":" + secPart.toFixed(2);

        //});


        // self.timestamp = rawData.lap.timestamp[0].value;

        // Editable data
        //self.seats = ko.observableArray([
        //    new SeatReservation("Steve", self.availableMeals[0]),
        //    new SeatReservation("Bert", self.availableMeals[0])
        //]);

        // Operations
        //self.addSeat = function () {
        //    self.seats.push(new SeatReservation("", self.availableMeals[0]));
        //}

        //self.removeSeat = function (seat) { self.seats.remove(seat) }

        //self.totalSurcharge = ko.computed(function () {
        //    var total = 0;
        //    for (var i = 0; i < self.seats().length; i++)
        //        total += self.seats()[i].meal().price;
        //    return total;
        //});



    }

    UIController.prototype.setup = function () {
        // Setup DOM event handling

        // this = #document by default since we are called from $(document).ready event handler

        if (!Modernizr.webworkers) {
            alert("This application will not work due to lack of webworker functionality");
        }

        
        if (!Modernizr.indexeddb) {
            alert("This application will not work due to lack of indexedDB");
        }

        if (!Modernizr.geolocation) {
            alert("This application will not work due to lack of geolocation");
        }

        // Capturing = false -> bubbling event
        FITUI.inpFITFile = document.getElementById('inpFITFile');
        FITUI.inpFITFile.addEventListener('change', FITUI.onFitFileSelected, false);


        //FITUI.btnParse = document.getElementById('btnParse')
        //FITUI.btnParse.addEventListener('click', FITUI.onbtnParseClick, false);


        //FITUI.btnSaveZones = document.getElementById('btnSaveZones')
        //FITUI.btnSaveZones.addEventListener('click', saveHRZones, false);

        FITUI.divMsgMap = document.getElementById('divMsgMap');

        FITUI.progressFITImport = document.getElementById('progressFITImport');

        FITUI.divSessionLap = $('#divSessionLap');
        
       
         
       

        

        
        //ko.applyBindings(FITUI.viewmodel);
        


    }

    UIController.prototype.showDataRecordsOnMap = function (dataRecords) {

        var FIT_MSG_FILEID = 0;
        var FIT_MSG_SESSION = 18;
        var FIT_MSG_LAP = 19;
        var FIT_MSG_RECORD = 20;
        var FIT_MSG_EVENT = 21;
        var FIT_MSG_ACTIVITY = 34;
        var FIT_MSG_FILE_CREATOR = 49;
        var FIT_MSG_HRV = 78;
        var FIT_MSG_DEVICE_INFO = 23;
        var FIT_MSG_LENGTH = 101;

        // Clear div
        while (divMsgMap.firstChild) {
            divMsgMap.removeChild(divMsgMap.firstChild);
        }

        dataRecords.forEach(function (element, index, array) { // forEach takes a callback

            var styleClass = "";
            switch (element) {
                case FIT_MSG_FILEID: styleClass = 'FITfile_id'; break;
                case FIT_MSG_SESSION: styleClass = 'FITsession'; break;
                case FIT_MSG_LAP: styleClass = 'FITlap'; break;
                case FIT_MSG_RECORD: styleClass = 'FITrecord'; break;
                case FIT_MSG_DEVICE_INFO: styleClass = 'FITdevice_info'; break;
                case FIT_MSG_ACTIVITY: styleClass = 'FITactivity'; break;
                case FIT_MSG_HRV: styleClass = 'FIThrv'; break;
                case FIT_MSG_EVENT: styleClass = 'FITevent'; break;
                case FIT_MSG_FILE_CREATOR: styleClass = 'FITfile_creator'; break;
                case FIT_MSG_LENGTH: styleClass = 'FITlength'; break;
                default: styleClass = 'FITunknown'; break;
            }

            divMsgMap.insertAdjacentHTML("beforeend", '<div class=' + styleClass + '></div>');
        })
    }

    //UIController.prototype.showFITHeader = function () {
    //    var headerHtml = '<p>Header size : ' + FITUI.fitFileManager.headerSize.toString() + ' bytes ' +
    //'Protocol version : ' + FITUI.fitFileManager.protocolVersion.toString() +
    //' Profile version : ' + FITUI.fitFileManager.profileVersion.toString() +
    //' Data size: ' + FITUI.fitFileManager.dataSize.toString() + ' bytes' +
    //' Data type: ' + FITUI.fitFileManager.dataType;
    //    if (FITUI.fitFileManager.headerCRC != undefined) {
    //        headerHtml += ' CRC: ' + parseInt(FITUI.fitFileManager.headerCRC, 10).toString(16);
    //    }

    //    return headerHtml;
    //}

    function deleteDb() {
        // https://developer.mozilla.org/en-US/docs/IndexedDB/IDBFactory#deleteDatabase
        // Problem : can only delete indexeddb one time in the same tab
        //self.postMessage({ response: "info", data: "deleteDb()" });

        var req;

        try {
            req = indexedDB.deleteDatabase("fit-import");
        } catch (e) {
            console.error(e.message);
        }
        //req.onblocked = function (evt) {
        //    self.postMessage({ respone: "error", data: "Database is blocked - error code" + (evt.target.error ? evt.target.error : evt.target.errorCode) });
        //}


        req.onsuccess = function (evt) {
            console.info("Delete "+evt.currentTarget.readyState);
            
        };

        req.onerror = function (evt) {
            console.error("Error deleting database");
        };

    }

    UIController.prototype.onFitFileSelected = function (e) {
        // console.log(e);
        e.preventDefault();

        

        FITUI.selectedFiles = e.target.files;

        var files = FITUI.selectedFiles;

        // Setup mutiple/batch workers
        console.log("Setup of " + files.length + " workers.");
        for (var fileNr = 0; fileNr < files.length; fileNr++) {
            //FITUI["fitFileManager" + fileNr.toString()] = new Worker("Scripts/fitFileManager.js")
            //FITUI["fitFileManager" + fileNr.toString()].addEventListener('message', FITUI.onFITManagerMsg, false);
            //FITUI["fitFileManager" + fileNr.toString()].addEventListener('error', FITUI.onFITManagerError, false);

        };

        // Make sure we terminate previous worker
        if (FITUI["fitFileManager"] !== undefined) {
            FITUI["fitFileManager"].removeEventListener('error', FITUI.onFITManagerError, false);
            FITUI["fitFileManager"].removeEventListener('message', FITUI.onFITManagerMsg, false);
            FITUI["fitFileManager"].terminate();
        }

        FITUI["fitFileManager"] = new Worker("Scripts/FITImport.js")
        FITUI["fitFileManager"].addEventListener('message', FITUI.onFITManagerMsg, false);
        FITUI["fitFileManager"].addEventListener('error', FITUI.onFITManagerError, false);


        // Need to adjust timestamps in the underlying data from Garmin time/System time

        // Start our worker now
        //var msg = { request: 'loadFitFile', "fitfile": files[0], "timeCalibration" : timeCalibration, "globalmessage" : "record", "fields" : "heart_rate altitude cadence speed", skipTimestamps : false };

        //var query = [];

        //query.push(

        //   // { message: "hrv", fields: "time" },
        //   { message: "file_id", fields: "type manufacturer product serial_number time_created number" },
        //   { message: "file_creator", fields: "software_version hardware_version" },
        //   { message: "record", fields: "timestamp position_lat position_long heart_rate altitude speed" },
        //   { message: "session", fields: "timestamp start_time start_position_lat start_position_long total_training_effect num_laps" },
        //   { message: "activity", fields: "timestamp total_timer_time num_sessions type event event_type local_timestamp event_group" },
        //  { message: "hrv", fields: "time" }
        //   );

       // deleteDb();

        var msg = {
            request: 'importFitFile', "fitfile": files[0]
            //, "query": query
        };

        
        if (FITUI.progressFITimportViewModel !== undefined)
            FITUI.progressFITimportViewModel = null;

        FITUI.progressFITimportViewModel = new progressFITimportViewModel();
        ko.applyBindings(FITUI.progressFITimportViewModel, document.getElementById("progressFITimport"));
        $("#progressFITimport").show();

        FITUI["fitFileManager"].postMessage(msg);



    }


    function saveHRZones(e) {

    }






    function getHRZones() {
        // Assume browser supports localStorage
        var localStorage = window.localStorage;
        var key = "FITView.HRZones";
        var myZonesJSONString = localStorage.getItem(key);

        var myZones;
        if (myZonesJSONString != null)
            myZones = JSON.parse(myZonesJSONString);
        else {
            console.info("Local storage of " + key + " not found, using default HR Zones");
            myZones = [{ name: 'Zone 1', min: 110, max: 120 },   // No storage found use default
                     { name: 'Zone 2', min: 121, max: 140 },
                     { name: 'Zone 3', min: 141, max: 150 },
                     { name: 'Zone 4', min: 151, max: 165 },
                     { name: 'Zone 5', min: 166, max: 256 }];
        }

        return myZones;
    }

})

// We have created a socalled Immediately-Invoked Function Expression (IIFE)

(); // Run it








