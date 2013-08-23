var static = require('node-static');
var webfolder = new static.Server('./web');

var eventListener = require('./mongolistener.js');
var aggregator = require('./aggregator.js');
var dispatcher = require('./dispatcher.js');

// event handler for incoming data
var processData = function(document) {
	console.info(document);
	
	if ( document.cid == "CLEAR" ) {
		aggregator.reset();
	} else {
		aggregator.addData(document);
	}
	
	// TODO push to clients only every x milliseconds
	dispatcher.emit( aggregator.aggregate() );
};

// init HTTP demon
var httpd = require('http').createServer(function(req,res) {
	req.addListener('end', function() {
		webfolder.serve(req,res);
	}
	).resume();
}
);
httpd.listen(8080);

// init client dispatcher
dispatcher.init(httpd, 'order_aggregates');

// init MongoDB listener
eventListener.init('localhost', 27017, 'test', 'orders', {_id:0, cid:1}, processData);

