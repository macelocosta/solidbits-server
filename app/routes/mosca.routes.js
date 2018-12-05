let dataController = require('./../controllers/data.controller');
let MQTTMessage = require('./../models/mqttMessage.model');
let MQTTEvent = require('./../models/mqttEvent.model');

function queryStringToJSON(queryString) {
  if(queryString.indexOf('?') > -1){
    queryString = queryString.split('?')[1];
  }
  var pairs = queryString.split('&');
  var result = {};
  pairs.forEach(function(pair) {
    pair = pair.split('=');
    result[pair[0]] = decodeURIComponent(pair[1] || '');
  });
  return result;
}

exports.salvarMensagem = function(packet) {
  try {
    let _payload = queryStringToJSON(packet.payload.toString());
    let message = {
      clientId: packet.topic.substring(packet.topic.indexOf("/") + 1),
      messageId: packet.messageId,
      payload: {
        temperature: _payload.temp,
        humidity: _payload.hum,
        fill: _payload.fill,
        volume: _payload.vol,
        weight: _payload.weight,
        isLidEvent: _payload.isLidEvt,
        lidOpenedDuration: _payload.s,
        isLidOpened: _payload.lidOpn
      }
    };
    dataController.saveMQTTMessage(message);
  } catch (error) {
    console.log(error);
  }
  // let message = new MQTTMessage({
  //   clientId: packet.topic.substring(packet.topic.indexOf("/") + 1),
  //   messageId: packet.messageId,
  //   payload: {
  //     temperature: _payload.temp,
  //     humidity: _payload.hum,
  //     fill: _payload.fill,
  //     vol: _payload.vol,
  //     weight: _payload.weight,
  //     isLidEvent: _payload.isLidEvt,
  //     lidOpenedDuration: _payload.s,
  //     isLidOpened: _payload.lidOpn
  //   }
  // });
  // MQTTMessage.create(message).then(
  //   function(message){
	// 		console.log('Message stored');
	// 	},
	// 	function(error){
  //     console.log('FAIL: Message not stored');
	// 	}
  // );
}

exports.registrarEvento = function(clientId, event) {
  // let mqttEvent = new MQTTEvent({
  //   clientId: clientId,
  //   event: event
  // });
  // MQTTEvent.create(mqttEvent).then(
  //   function(event){
	// 		console.log('Event stored');
	// 	},
	// 	function(error){
  //     console.log('FAIL: Event not stored');
	// 	}
  // );
}