var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT
var Gate = {}
var Helper = {}

app.use(express.static(__dirname + "/"))
var server = http.createServer(app)
server.listen(port)
var wss = new WebSocketServer({server: server})
var pg = require('pg')
pg.defaults.ssl = true;


Helper.mysqlEscape = function(stringToEscape){
	return stringToEscape
		.replace("\\", "\\\\")
		.replace("\'", "\\\'")
		.replace("\"", "\\\"")
		.replace("\n", "\\\n")
		.replace("\r", "\\\r")
		.replace("\x00", "\\\x00")
		.replace("\x1a", "\\\x1a");
}

Gate.Init_tables = function () {
	client = new pg.Client(process.env.DATABASE_URL);
	client.connect();
	query = client.query('CREATE TABLE IF NOT EXISTS reports (content TEXT)');
	query.on('end', function() { client.end(); });
}

Gate.Insert_data = function (raw_content) {
	client = new pg.Client(process.env.DATABASE_URL);
	client.connect();
	query = client.query("INSERT INTO reports (content) VALUES('" + raw_content + "')");
	query.on('end', function() { client.end(); });
}

Gate.Init_tables();

wss.on("connection", function(ws) {
	ws.on('message', function(message) {
		message = Helper.mysqlEscape(message)
		Gate.Insert_data(message)
	})

})
