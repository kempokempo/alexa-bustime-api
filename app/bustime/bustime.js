// This is the module that actually makes the requests to the bustime API


module.exports = function () {
    var http = require('http');
    var moment = require('moment');
    this.getBusTimeDetails = function (theStop, theBus, callback) { // this queries the mta info api for all bus details
        
        var host = 'bustime.mta.info';
        var context = '/api/siri/stop-monitoring.json?';
        var apiKey = '8e6b54cd-8ad9-43a4-af10-7c88bccb5bed';
        // Per docs https://bustime.mta.info/wiki/Developers/SIRIStopMonitoring
        var apiVersion = 2;
        var opRef = 'MTA';
        var lineRef; //will be built dynamicallyvar
        var results;
        params = {
            key: apiKey,
            version: apiVersion,
            OperatorRef: opRef,
            MonitoringRef: theStop,
            LineRef: theBus,
            StopMonitoringDetailLevel: "normal",
            MaximumNumberOfCallsOnwards: 1,
            MaximumStopVisits: 2,
            MinimumStopVisitsPerLine: 1
        };
        
        var queryString = Object.keys(params)
    .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); })
    .join('&');
        var path = context + queryString;
        console.log(path);
        console.log(host);
        
        return http.get({
            path: path,
            host: host
        }, function (response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });
            response.on('end', function () {
                var parsed = JSON.parse(str);
                if (typeof callback == "function") {
                    callback(parsed);
                }
            });
        });
    };
     
    this.getBusTime = function (theStop, theBus, callback) {
        getBusTimeDetails(theStop, theBus, function (result) {
            // so let's iterate through the object and grab the bits we want
            var busObj = result.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
            var busObject = [];
            for (var i = 0; i < busObj.length; i++) {
                var estArrival = busObj[i].MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime;
                var minutesAway = moment(estArrival).fromNow(); //this is freaking genius
                var temp = {
                    name: busObj[i].MonitoredVehicleJourney.PublishedLineName[0],
                    dest: busObj[i].MonitoredVehicleJourney.DestinationName[0],
                    arrivalTime: estArrival,
                    minsAway: minutesAway
                };
                busObject.push({ bus: temp });
            }
            
            callback(busObject); //the key with callbacks is that the call to a callback can be within another callback.
        });

    };
}
