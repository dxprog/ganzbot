var WebSocketServer = require('ws').Server;
var Ganzbot = require('./src/ganzbot');

var ganzbot = new Ganzbot({ serialPort: '/dev/tty.usbserial-A6024D1Q' });
var server = new WebSocketServer({ port: 8080 });

var isInitialized = false;

function handleWSMessage(data) {
  try {
    data = JSON.parse(data.toString());
    if (data.msg && data.emotion) {
      ganzbot.queue(data.msg, data.emotion);
    }
  } catch (exc) {
    console.error(exc);
  }
}

server.on('connection', function(ws) {
  console.log('[ws] New client connection');
  ws.on('message', handleWSMessage);
});