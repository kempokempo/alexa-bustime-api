'use strict';

var http = require('http')
    , AlexaSkill = require('./AlexaSkill')
    , APP_ID = 'amzn1.ask.skill.d044ec80-ded2-4967-a224-8b14d4821f9a';
 

// build the request url
var url = function (busId, stopId) {
    return 'http://api.martinkemp.nyc/api/bustime?bus=' + busId + '&busStop=' + stopId;
};

// query my api for results
var getJsonFromApi = function (busId, stopId, callback) {
    // var uri = url(busId, stopId);
    var uri = 'http://api.martinkemp.nyc/api/martinwork';
    console.log(uri);
    http.get(uri, function (res) {
        var body = '';

        res.on('data', function (data) {
            body += data;
        });

        res.on('end', function () {
            console.log('response is: ' + body);
            var result = JSON.parse(body);
            // var result = body;
            callback(result);
        });

    }).on('error', function (e) {
        console.log('ERROR: ' + e);
    });
};

var handleNextBusRequest = function (intent, session, response) {
    // MTABC_BM3 or MTABC_BM4 for realz
    // use MTA NYCT_B35 for testing as it's regular
    // user 302766 for church\7th
    var bus = 'MTA NYCT_B35',
        busStop = '302766'; // not currently used
    getJsonFromApi(bus, busStop, function (data) {
        if (data.buses.length > 0) {
            var text = data.buses[0].bus;
            var cardText = 'There is a ' + text.name + ' to ' + text.dest + ' ' + text.minsAway;
        } else {
            var text = 'No buses are coming';
            var cardText = text;
        }

        var heading = 'Next bus at stop: ' + busStop;
        response.tellWithCard(cardText, heading, cardText);
    });
};

var Buster = function () {
    AlexaSkill.call(this, APP_ID);
};

Buster.prototype = Object.create(AlexaSkill.prototype);
Buster.prototype.constructor = Buster;

Buster.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var output = 'Welcome to buster. Ask how long until the next bus';
    var reprompt = 'Just say bus, idiot';

    response.ask(output, reprompt);
}

Buster.prototype.intentHandlers = {
    GetNextBusIntent: function (intent, session, response) {
        handleNextBusRequest(intent, session, response);
    },
    HelpIntent: function (intent, session, response) {
        var speechOutput = 'Get the time until your next bus.';
        response.ask(speechOutput);
    }
};

exports.handler = function (event, context) {
    var skill = new Buster();
    skill.execute(event, context);
};