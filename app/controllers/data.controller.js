let MQTTMessage = require('./../models/mqttMessage.model');
let	errorHandler = require('./error-handler.controller');

exports.dataInput = function(req, res) {
  let data = req.body;
  let message = new MQTTMessage(data);
  message.save(function(err, record) {
    if (err) {
      console.log(err);
      res.status(500).json({message: 'error'});
    }
    if (record) {
      res.status(200).json({message: 'ok'});
    }
  })
}

exports.getOverviewMonitoring = function(req, res) {
  MQTTMessage.find({}).sort('-createdAt').limit(60).exec(function(err, records) {
    if (err) {
      res.status(500).json({message: 'error'});
    }
    if (records) {
      res.status(200).json({records: records});
    }
  })
}

exports.getBiggestWasteProducers = function(req, res, next) {
  let biggestWasteProducers = [
    {'place': 'Biblioteca', 'value': 32},
    {'place': 'Área de Convivência', 'value': 43},
    {'place': 'Sala de design', 'value': 24}
  ];
	res.status(200).json(biggestWasteProducers);
}
