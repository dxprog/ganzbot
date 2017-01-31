const { BluetoothSerialPortServer } = require('bluetooth-serial-port');

const UUID = '99cb13b6-e75b-11e6-bf01-fe55135034f3';

function onDataReceived(buffer) {
  console.log(buffer.toString());
}

const server = new BluetoothSerialPortServer();
server.listen(clientAddress => {
  console.log(`Client ${clientAddress} connected!`);
  server.on('data', onDataReceived);
});