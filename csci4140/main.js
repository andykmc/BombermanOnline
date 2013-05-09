// Include our library
var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var wsServer = require("./wsServer");
var wsRouter = require("./wsRouter");
var wsRequestHandlers = require("./wsRequestHandlers");

var port = process.argv[2];
port = isNaN(port) ? 8080 : parseInt(port);

// Mapping for URL path & handler function
var handlers = {
	valid:{},	// Valid URL with specific handler
	read:{},	// Special handler for specifc folder
	invalid:{}	// Error handler
};

handlers.valid["/"] = requestHandlers.index;
handlers.valid["/index"] = requestHandlers.index;

handlers.read["html"] = requestHandlers.readHTML;
handlers.read["scripts"] = requestHandlers.readJS;
handlers.read["styles"] = requestHandlers.readCSS;
handlers.read["images"] = requestHandlers.readImage;
handlers.invalid[404] = requestHandlers.error404;
handlers.invalid[500] = requestHandlers.error500;

// Create and start HTTP server
var serverObj = server.start(router.route, handlers, port);

// Websocket handler mapping
var wsHandlers = {
	utf8 : [],
	binary: []
};

wsHandlers.utf8["setName"] = wsRequestHandlers.setName;
wsHandlers.utf8["ping"] = wsRequestHandlers.ping;
wsHandlers.utf8["disconnect"] = wsRequestHandlers.disconnect;

wsHandlers.utf8["payloadTestStart"] = wsRequestHandlers.payloadTestStart;
wsHandlers.utf8["payloadTest"] = wsRequestHandlers.payloadTest;
wsHandlers.utf8["chat_updateClientList"] = wsRequestHandlers.chat_updateClientList;
wsHandlers.utf8["chat_say"] = wsRequestHandlers.chat_say;
//Lobby handler-----------------------------------------------
wsHandlers.utf8["icon"] = wsRequestHandlers.lobbyIcon;
wsHandlers.utf8["stat"] = wsRequestHandlers.playerStat;
wsHandlers.utf8["rmList"] = wsRequestHandlers.rmList;
wsHandlers.utf8["joinRoom"] = wsRequestHandlers.joinRoom;
//End Of Lobby handler----------------------------------------
//Gameroom handler--------------------------------------------
wsHandlers.utf8["host_update"] = wsRequestHandlers.host_update;
wsHandlers.utf8["seat_update"] = wsRequestHandlers.seat_update;


// Create and start websocket server
var wsServerObj = wsServer.start(serverObj, wsRouter.route, wsHandlers);
