(function() {
  var btnSay = document.getElementById('btnSay');
  var btnAdd = document.getElementById('btnAdd');
  var txtUser = document.getElementById('username');
  var txtMsg = document.getElementById('msg');
  var msgDisplay = document.getElementById('thingsToSay');
  var socket = new WebSocket('ws://localhost:8080');
  var msgQueue = [];

  function displayQueueMessage(msg) {
    var el = document.createElement('li');
    el.className = 'emo-neutral';
    if (msg.emotion === 'Angry') {
      el.className = 'emo-angry';
    } else if (msg.emotion === 'Sad') {
      el.className = 'emo-sad';
    }
    el.appendChild(document.createTextNode(msg.msg));
    msgDisplay.appendChild(el);
  }

  function queueMessage() {
    var emotion = document.querySelector('input[name=emotion]:checked');
    emotion = emotion ? emotion.value : 'Neutral';
    var msg = {
      user: txtUser.value,
      msg: txtMsg.value,
      emotion: emotion
    };
    msgQueue.push(msg);
    displayQueueMessage(msg);
    txtMsg.value = '';
  }

  socket.onopen = function() {
    console.log('looks like we are open for biz');
  };

  btnAdd.addEventListener('click', queueMessage);

  btnSay.addEventListener('click', function() {
    if (txtMsg.value.length) {
      queueMessage();
    }
    socket.send(JSON.stringify(msgQueue));
    msgQueue = [];
    msgDisplay.innerHTML = '';
  });
}());