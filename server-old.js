﻿
console.log('blah')
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// configure bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = 8080;

// configure database connection
// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/bustime');

// get the model
var Bus = require('./app/models/bus.js');

// get the bustimejs
require('./app/bustime/bustime.js')();

// Set up routes
var router = express.Router();

// middleware!
// just for logging, honey. Will execute on every request
router.use(function (req, res, next) {
    console.log('Something is happening...');
    next(); //makes sure we go to the othe routes after this
});

router.route('/bus')
    .post(function (req, res) {
    var bus = new Bus();
    bus.name = req.body.name;
    bus.stop = req.body.stop;
    
    bus.save(function (err) {
        if (err)
            res.send(err);
        
        res.json({ message: 'Bus created!' });
    });
})
    .get(function (req, res) {
    Bus.find(function (err, buses) {
        if (err)
            res.send(err);
        res.json(buses);
    });
});

router.route('/bus/:bus_id')
    .get(function (req, res) {
    Bus.findById(req.params.bus_id, function (err, bus) {
        if (err)
            res.send(err);
        res.json(bus);
    });
})
    .put(function (req, res) {
    Bus.findById(req.params.bus_id, function (err, bus) {
        
        if (err)
            res.send(err);
        bus.name = req.body.name;
        bus.stop = req.body.stop;
        
        bus.save(function (err) {
            if (err)
                res.send(err);
            res.json({ message: 'Bus updated', bus_id: req.params.bus_id });
        });
    });
})
    .delete(function (req, res) {
    Bus.remove({
        _id: req.params.bus_id
    }, function (err, bus) {
        if (err)
            res.send(err);
        res.json({ message: 'deleted', bus_id: req.params.bus_id });
    });
});

router.route('/bustime')
    .get(function (req, res) {
    var result;
    // MTABC_BM3 or MTABC_BM4 for realz
    // use MTA NYCT_B35 for testing as it's regular
    getBusTime('302766', 'MTA NYCT_B35', function (bt) {
        res.json(bt);
    });
    
});

router.get('/', function (req, res) {
    res.json({ message: 'at the root of the api' });
});

// Register routes
app.use('/api', router);

app.listen(port);
console.log('listening on port ' + port);
