let MQTTMessage = require('./../models/mqttMessage.model');
let MQTTEvent = require('./../models/mqttEvent.model');

exports.salvarMensagem = function(packet) {
  let _payload = JSON.parse(packet.payload.toString());
  let message = new MQTTMessage({
    clientId: packet.topic.substring(packet.topic.indexOf("/") + 1),
    messageId: packet.messageId,
    payload: {
      temperature: _payload.temp,
      humidity: _payload.hum,
      fill: _payload.fill,
      vol: _payload.vol,
      weight: _payload.weight,
      isLidEvent: _payload.isLidEvt,
      lidOpenedDuration: _payload.s,
      isLidOpened: _payload.lidOpn
    }
  });
  MQTTMessage.create(message).then(
    function(message){
			console.log('Message stored');
		},
		function(error){
      console.log('FAIL: Message not stored');
		}
  );
}

exports.registrarEvento = function(clientId, event) {
  let mqttEvent = new MQTTEvent({
    clientId: clientId,
    event: event
  });
  MQTTEvent.create(mqttEvent).then(
    function(event){
			console.log('Event stored');
		},
		function(error){
      console.log('FAIL: Event not stored');
		}
  );
}