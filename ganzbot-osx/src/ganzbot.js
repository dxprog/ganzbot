var Promise = require('bluebird');
var exec = require('child_process').exec;
var SerialPort = require('serialport');

var QUEUE_DEBOUNCE = 100;
var SERVO_DELAY = 300;
var EMOTION = {
  Off: '0',
  Neutral: '1',
  Angry: '2',
  Sad: '3'
};

function Ganzbot(options) {
  if (!options.serialPort) {
    throw new Error('A serial port must be provided');
  }

  this._port = new SerialPort(options.serialPort, { baudRate: 9600 });
  this._port.on('open', this._handlePortOpen.bind(this));
  this._queue = [];
  this._speaking = false;
  this._queueTimer = null;
}

/**
 * Queues a message for Ganzbot
 *
 * @param {string} msg The message to say
 * @param {string} emotion The emotion to set. Defaults to "Neutral"
 */
Ganzbot.prototype.queue = function queue(msg, emotion) {
  var self = this;
  if (Array.isArray(msg)) {
    msg.forEach(function(msg) {
      self._queue.push({
        msg: msg.msg,
        emotion: msg.emotion
      });
    });
  } else {
    emotion = emotion || 'Neutral';
    this._queue.push({
      msg: msg,
      emotion: emotion
    });
  }
  this._processQueue();
};

/**
 * Makes Ganzbot speak
 *
 * @param {string} msg What to make Ganzbot say
 * @param {string} voice The voice to say it in. Defaults to "alex"
 * @return {Promise} Promise that resolves when done speaking
 */
Ganzbot.prototype.say = function say(msg, voice) {
  return new Promise(function(resolve, reject) {
    voice = voice || 'alex';
    exec('say -v ' + voice + ' "' + msg + '"', function() {
      resolve();
    });
  });
};

/**
 * Sets Ganzbot's emotional state
 *
 * @param {string} emotion The emotion to set (as defined in EMOTION)
 * @return {Promise} Promise that resolves when emotion goes through
 */
Ganzbot.prototype.setEmotion = function setEmotion(emotion) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (isInitialized && EMOTION.hasOwnProperty(emotion)) {
      self._port.write(EMOTION[emotion], function(err) {
        if (!err) {
          setTimeout(resolve, SERVO_DELAY);
        } else {
          reject(err);
        }
      });
    }
  });
}

/**
 * Processes the message queue
 *
 * @private
 */
Ganzbot.prototype._processQueue = function processQueue() {
  var self = this;

  function debounceQueue() {
    clearTimeout(self._queueTimer);
    self._queueTimer = setTimeout(self._processQueue.bind(self), QUEUE_DEBOUNCE);
  }

  if (self._queue.length) {
    if (!self._speaking) {
      var msg = self._queue.shift();
      self._speaking = true;
      self.setEmotion(msg.emotion)
        .then(function() {
          return self.say(msg.msg);
        }).then(function() {
          self._speaking = false;

          // Keep the queue going
          debounceQueue();
        });
    } else {
      debounceQueue();
    }
  }
};

/**
 * Handles the serial port open event
 *
 * @private
 */
Ganzbot.prototype._handlePortOpen = function handlePortOpen() {
  this._port.on('data', this._handleSerialData.bind(this));
  console.log('[ganzbot] Succcessfully connected to Ganzbot');
};

/**
 * Handles the serial port data event
 *
 * @private
 * @param {Buffer} data The serial data
 */
Ganzbot.prototype._handleSerialData = function handleSerialData(data) {
  var cmd = data.toString().replace('\n', '');
  if (cmd === 'B') {
    isInitialized = true;
    console.log('[ganzbot] Initialized and ready to go!');
  } else {
    console.log('[ganzbot]', data.toString());
  }
};

module.exports = Ganzbot;