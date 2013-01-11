﻿//use strict
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

    if (values.length !== timestamps.length)
        console.warn("Length of arrays to comine is not of same size; values length ="+values.length.toString()+ " timestamp length : "+timestamps.length.toString());

    //if (verifyTimestamps(timestamps)) {
        values.forEach(function (element, index, array) {
            combined.push([util.convertTimestampToLocalTime(timestamps[index]), element]);
        });
        return combined;
    //} else
    //    return values;
}

function verifyTimestamps(timestamps) {
    var valid = true;
    var len = timestamps.length;

    for (var index=0;index<len-1;index++)
        if (timestamps[index+1] < timestamps[index])
        {
            valid = false;
            break;
        }

    return valid;
}
        

UIController.prototype.showCharts = function (rawData, skipTimestamps, chartType) {
    

    var chartId = "testChart";
    var divChart = document.getElementById(chartId);
    divChart.style.visibility = "visible";
    var seriesSetup = [];

    // Record data

    if (rawData.record !== undefined) {

        if (rawData.record["heart_rate"] !== undefined)
            seriesSetup.push({ name: 'Heart rate', data: combine(rawData.record["heart_rate"], rawData.record["timestamp"]), id: 'heartrateseries' })
        if (rawData.record["altitude"] !== undefined)
            seriesSetup.push({ name: 'Altitude', data: combine(rawData.record["altitude"], rawData.record["timestamp"]) });
        if (rawData.record["cadence"] !== undefined)
            seriesSetup.push({ name: 'Cadence', data: combine(rawData.record["cadence"], rawData.record["timestamp"]) });
        if (rawData.record["speed"] !== undefined) {
            rawData.record.speed.forEach(function (element, index, array) {
                array[index][0] = element[0] * 3.6;
            });
            seriesSetup.push({ name: 'Speed', data: combine(rawData.record["speed"], rawData.record["timestamp"]) });
        }
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

    // Hrv
    //if (rawData.hrv !== undefined) {
    //    if (rawData.hrv.time !== undefined) {
    //        skipTimestamps = true;
    //        //chartType = 'bar';
    //        // Seems like line rendering is much faster than bar...
    //        seriesSetup.push({ name: 'Heart rate variability (RR-interval)', data: rawData.hrv.time })
    //    }
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
    if (skipTimestamps)
        xAxisType = '';


    var chartOptions = {
        renderTo: chartId,
        type: chartType,
        // Allow zooming
        zoomType: 'xy'
    }

    //if (rawData.hrv !== undefined)
    //    chartOptions.inverted = true;

    var d = new Date();
    console.log("Starting highchart now " + d );
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

        series: seriesSetup

    });

    d = new Date();
    console.log("Finishing highcharts now " + d);


    //FITUI.showSpeedVsHeartRate(rawData);

    //FITUI.showHRZones(rawData);


}

UIController.prototype.showHRZones = function(rawData) {
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



UIController.prototype.showMap = function(map,session)
{
    // Plot markers for start of each session
     
    var util = FITUtility();
    
   
    if (session.start_position_lat == undefined)
        return;


    session.start_position_lat.forEach(function (element, index, array) {

        var lat = session.start_position_lat[index];
        var long = session.start_position_long[index];

        
        var startTimeDate = new Date();
        startTimeDate.setTime(util.convertTimestampToUTC(session.timestamp[index]));

        

        if (lat !== undefined && long !== undefined) {
            var latlong = new google.maps.LatLng(util.semiCirclesToDegrees(lat), util.semiCirclesToDegrees(long));
            
            map.setCenter(latlong);

            var marker = new google.maps.Marker({
                position: latlong,
                title: startTimeDate.toLocaleTimeString(),
                map: map
            });
        }
    });



}

UIController.prototype.initMap = function () {

    var myCurrentPosition, newMap =undefined;

    var mapOptions = {

        zoom: 13,
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


UIController.prototype.showPolyline = function (map,record) {

    if (record.position_lat === undefined || record.position_lat === null)
        return;

    var activityCoordinates = [];
    var util = FITUtility();
   
    record.position_lat.forEach( function (element,index,array) {
        activityCoordinates.push(new google.maps.LatLng(util.semiCirclesToDegrees(element),util.semiCirclesToDegrees(record.position_long[index])));
    })

    var activityPath = new google.maps.Polyline({
        path: activityCoordinates,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    activityPath.setMap(map);

}


UIController.prototype.onFITManagerMsg = function (e) {
    
    var data = e.data;

    switch (data.response) {
        case 'rawData':
            //var rawData = JSON.parse(data.rawdata);
            var rawData = data.rawdata;

            if (this.map === undefined)
                this.map = FITUI.initMap();

            if (rawData.session != undefined)
                FITUI.showMap(this.map,rawData.session);

            if (rawData.record != undefined)
                FITUI.showPolyline(this.map,rawData.record);

            FITUI.showCharts(rawData, false, 'line');
            FITUI.showDataRecordsOnMap(data.datamessages);
            break;
        case 'header':
            var headerInfo = data.header;
            break;
        default:
            console.error("Received unrecognized message from worker " + data.response); break;
    }

    
    
}

UIController.prototype.onFITManagerError = function (e) {
    console.error("Error in worker, status " + e.toString());
}

UIController.prototype.setup = function () {
    // Setup DOM event handling

    // this = #document by default since we are called from $(document).ready event handler

    //if (!Modernizr.webworkers) {
    //    alert("This application will not work due to lack of webworker functionality");
    //}

    FITUI.outConsole = document.getElementById('outConsole');

    // Capturing = false -> bubbling event
    FITUI.inpFITFile = document.getElementById('inpFITFile');
    FITUI.inpFITFile.addEventListener('change', FITUI.onFitFileSelected, false);

   
    //FITUI.btnParse = document.getElementById('btnParse')
    //FITUI.btnParse.addEventListener('click', FITUI.onbtnParseClick, false);


    //FITUI.btnSaveZones = document.getElementById('btnSaveZones')
    //FITUI.btnSaveZones.addEventListener('click', saveHRZones, false);

    FITUI.divMsgMap = document.getElementById('divMsgMap');
   

}

UIController.prototype.showDataRecordsOnMap = function (dataRecords) {
    
    // Clear div
    while (divMsgMap.firstChild) {
        divMsgMap.removeChild(divMsgMap.firstChild);
    }

   dataRecords.forEach(function (element,index,array) { // forEach takes a callback
    
        var styleClass = "";
        switch (element) {
            case 0: styleClass = 'FITfile_id'; break;
            case 18: styleClass = 'FITsession'; break;
            case 19: styleClass = 'FITlap'; break;
            case 20: styleClass = 'FITrecord'; break;
            case 34: styleClass = 'FITactivity'; break;
            
            case 78: styleClass = 'FIThrv'; break;
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
    
    FITUI["fitFileManager"] = new Worker("Scripts/FITReader.js")
    FITUI["fitFileManager"].addEventListener('message', FITUI.onFITManagerMsg, false);
    FITUI["fitFileManager"].addEventListener('error', FITUI.onFITManagerError, false);
   

    // Need to adjust timestamps in the underlying data from Garmin time/System time

    // Start our worker now
    //var msg = { request: 'loadFitFile', "fitfile": files[0], "timeCalibration" : timeCalibration, "globalmessage" : "record", "fields" : "heart_rate altitude cadence speed", skipTimestamps : false };

    var query = [];
  
    query.push(
       
       // { message: "hrv", fields: "time" },
       { message: "file_id", fields: "type manufacturer product serial_number time_created number", skiptimestamps: true },
       { message: "file_creator", fields: "software_version hardware_version", skiptimestamps: true},
       { message: "record", fields: "timestamp position_lat position_long heart_rate altitude speed", skiptimestamps: false},
       { message: "session", fields: "timestamp start_time start_position_lat start_position_long total_training_effect num_laps", skiptimestamps: true },
      // { message: "activity", fields: "timestamp total_timer_time num_sessions type event event_type local_timestamp event_group", skiptimestamps: true }
      { message: "hrv", fields: "time", skiptimestamps : true }
       );

    var msg = { request: 'loadFitFile', "fitfile": files[0],  "query" : query };

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
        console.info("Local storage of "+key+" not found, using default HR Zones");
        myZones = [{ name: 'Zone 1', min: 110, max: 120 },   // No storage found use default
                 { name: 'Zone 2', min: 121, max: 140 },
                 { name: 'Zone 3', min: 141, max: 150 },
                 { name: 'Zone 4', min: 151, max: 165 },
                 { name: 'Zone 5', min: 166, max: 256 }];
    }

    return myZones;
}









