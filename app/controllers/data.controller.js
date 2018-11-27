let MQTTMessage = require('./../models/mqttMessage.model');
let	errorHandler = require('./error-handler.controller');
const influx = require('./../config/influx');
let influx_ = influx();

exports.dataInput = function(req, res) {
  let data = req.body;
  influx_.writePoints([
    {
      measurement: 'bin',
      tags: {
        bin_id: data.clientId
      },
      fields: {
        temperature: data.payload.temperature,
        humidity: data.payload.humidity,
        fill: data.payload.fill,
        volume: data.payload.volume,
        weight: data.payload.weight,
        isLidEvent: data.payload.isLidEvent,
        isLidOpened: data.payload.isLidOpened,
        lidOpenedDuration: data.payload.lidOpenedDuration
      },
      timestamp: data.created
    }
  ], {
    database: 'solidbits',
    precision: 's'
  }).then(result => {
    res.status(200).json({message: 'ok'});
  }).catch(error => {
    console.error(`Error saving data to InfluxDB! ${error.stack}`)
    res.status(500).json({message: 'error'});
  });
  // let message = new MQTTMessage(data);
  // message.save(function(err, record) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   if (record) {
  //   }
  // })
  
}

exports.saveMQTTMessage = function(data) {
  influx_.writePoints([
    {
      measurement: 'bin',
      tags: {
        bin_id: data.clientId
      },
      fields: {
        temperature: data.payload.temperature != 'n' ? data.payload.temperature: undefined,
        humidity: data.payload.humidity != 'n' ? data.payload.humidity: undefined,
        fill: data.payload.fill != 'n' ? data.payload.fill: undefined,
        volume: data.payload.volume != 'n' ? data.payload.volume: undefined,
        weight: data.payload.weight != 'n' ? data.payload.weight: undefined,
        isLidEvent: data.payload.isLidEvent == '' ? false : true,
        isLidOpened: data.payload.isLidOpened == '' ? false : true,
        lidOpenedDuration: parseFloat(data.payload.lidOpenedDuration) == NaN ? parseFloat(data.payload.lidOpenedDuration) : undefined,
      },
    }
  ], {
    database: 'solidbits',
    precision: 's'
  }).then(result => {
    console.log("Stored message from client ", data.clientId);
  }).catch(error => {
    console.log(error);
  });
  // let message = new MQTTMessage(data);
  // message.save(function(err, record) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   if (record) {
  //   }
  // })
  
}

exports.getOverviewMonitoring = function(req, res) {
  let time = req.query.time;
  let interval = req.query.interval;
  if (time && interval) {
    influx_.query(`SELECT mean("fill") AS "fill" FROM "solidbits"."solidbits"."bin" WHERE time > now() - ${time} GROUP BY time(${interval}) FILL(linear)`).then(result => {
      res.status(200).json({json: result});
    }).catch(e => {
      errorHandler.answerWithError(e, req, res);
    });
  } else {
    errorHandler.answerWithError({custom_code: 400}, req, res);
  }
}

exports.getCurrentWeight = function(req, res) { //7d
  influx_.query(`SELECT mean("weight") AS "weight" FROM "solidbits"."solidbits"."bin" WHERE time > now() - 30d`).then(result => {
    res.status(200).json({value: result[0].weight.toFixed(2)});
  }).catch(e => {
    errorHandler.answerWithError(e, req, res);
  });
}

exports.getCurrentVolume = function(req, res) { //7d
  influx_.query(`SELECT mean("volume") AS "volume" FROM "solidbits"."solidbits"."bin" WHERE time > now() - 30d`).then(result => {
    res.status(200).json({value: result[0].volume.toFixed(2)});
  }).catch(e => {
    errorHandler.answerWithError(e, req, res);
  });
}

exports.getBinsByFillLevel = function(req, res) { //7d
  influx_.query(`SELECT mean("fill") AS "fill" FROM "solidbits"."solidbits"."bin" WHERE time > now() - 30d GROUP BY "bin_id"`).then(result => {
    let response = {
      below20: 0,
      between20_50: 0,
      between50_70: 0,
      between70_90: 0,
      above90: 0
    };
    result.forEach(result_ => {
      if (result_.fill > 0 && result_.fill <= 20) {
        response.below20 ++;
      } else if (result_.fill > 20 && result_.fill <= 50) {
        response.between20_50 ++;
      } else if (result_.fill > 50 && result_.fill <= 70) {
        response.between50_70 ++;
      } else if (result_.fill > 50 && result_.fill <= 90) {
        response.between70_90 ++;
      } else if (result_.fill > 90 && rresult_esult.fill < 100) {
        response.above90 ++;
      }
    });
    res.status(200).json({data: response});
  }).catch(e => {
    errorHandler.answerWithError(e, req, res);
  });
}

exports.getBiggestWasteProducers = function(req, res, next) {
  let biggestWasteProducers = [
    {'place': 'Biblioteca', 'value': 32},
    {'place': 'Área de Convivência', 'value': 43},
    {'place': 'Sala de design', 'value': 24}
  ];
	res.status(200).json(biggestWasteProducers);
}

