var express = require('express'),
	Sequelize = require('sequelize'),
	bodyParser = require('body-parser'),
	models = require('./models'),
	compression = require('compression');

// models.sequelize.sync({force:true});
var env = process.env.NODE_ENV || "development";
var config = require('./config/config.json')[env];

models.sequelize.sync().then(require('./database-initial-data'));

var app = express();

app.use(compression());
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	next();
});

app.use(bodyParser.urlencoded({
	extended: true,
	limit: '50mb'
}));
app.use(bodyParser.json({ limit: '50mb' }));

var urlPrefix = "";


app.use(urlPrefix + '/api', require('./route/route.js')());


app.use(urlPrefix + '/', express.static('static'));

function sendFile(req, res) {
	res.sendFile(__dirname + "/static/index.html");
}
app.use(urlPrefix + '/explore', sendFile);
app.use(urlPrefix + '/status', sendFile);
app.use(urlPrefix + '/login', sendFile);
app.use(urlPrefix + '/leaderboard', sendFile);
app.use(urlPrefix + '/barcode', sendFile);

var port = process.env.PORT || config.port || 8080;

var server = app.listen(port, function () {

	var host = server.address().address;

	console.log('Example app listening at http://%s:%s', host, port);

});

domain = require('domain'),
	d = domain.create();

d.on('error', function (err) {
	console.error(err);
});