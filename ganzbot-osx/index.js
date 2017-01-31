const { BluetoothSerialPort } = require('bluetooth-serial-port');

const btSerial = new BluetoothSerialPort();
btSerial.on('found', (address, name) => {
  btSerial.findSerialPortChannel(address, channel => {
    btSerial.connect(address, channel, () => {
      console.log(`Connected: ${address} / ${channel}`);
      btSerial.write(new Buffer('some data', 'utf-8'), (err, bytesWritten) => {
        if (!err) {
          btSerial.close();
        }
      });
    });
  });
});