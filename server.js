
console.log('blah')
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// configure bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = 8081;

// get the model
// var Bus = require('./app/models/bus.js');

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

router.route('/bustime')
    .get(function (req, res) {
        // MTABC_BM3 or MTABC_BM4 for realz
        // use MTA NYCT_B35 for testing as it's regular
        // user 302766 for church\7th
        var busStop = req.query.busStop,
            bus = req.query.bus;
        if (bus == null || busStop == null) {
            res.status(422).send('Please specify bus and busStop query params');
        } else {
            getBusTime(busStop, bus, function (bt) {
                res.json(bt);
            });
        }   
});

router.get('/', function (req, res) {
    res.json({ message: 'at the root of the api' });
});

// Register routes
app.use('/api', router);

app.listen(port);
console.log('listening on port ' + port);

