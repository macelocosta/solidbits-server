const influx = require('./../config/influx');
let influx_ = influx();
const Business = require('./../models/business.model');

let io;

exports.initIO = function(https_server) {
  io = require('socket.io').listen(https_server);
  console.log('[Socket] listening...');

  setInterval(() => {
    weightAndVolume();
    binsByFillLevel();
    filledBinsPerArea();
  }, 30000);

  io.on('connection', function(client){
    console.log('[Socket] an user connected');

    client.on('get-now', function(){
      weightAndVolume();
      binsByFillLevel();
      filledBinsPerArea();
      biggestWasteProducers();
      mapData();
    });

    client.on('bins-by-fill-level', function(){
      binsByFillLevel();
    });

    client.on('biggest-waste-producers', function(){
      biggestWasteProducers();
    });

    client.on('map-data', function(){
      mapData();
    });
  });

  let weightAndVolume = function() {
    influx_.query(`SELECT mean("weight") AS "weight", mean("volume") AS "volume" FROM "solidbits"."solidbits"."bin" WHERE time > now() - 1m`).then(result => {
      io.emit('overview-current-weight', { value: result[0].weight ? result[0].weight.toFixed(2) : 'no-data' });
      io.emit('overview-current-volume', { value: result[0].volume ? result[0].volume.toFixed(2) : 'no-data' });
    });
  }  

  let binsByFillLevel = function() {
    influx_.query(`SELECT mean("fill") AS "fill" FROM "solidbits"."solidbits"."bin" WHERE time > now() - 1m GROUP BY "bin_id"`).then(result => {
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
      io.emit('bins-by-fill-level', {response});
    });
  }

  let filledBinsPerArea = function() {
    Business.find({}).lean().exec(function(err, result) {
      if (result) {
        let parent = result[0].children[0].name;
        let bin_ids = [];
        let children = result[0].children[0];
        for (let i = 0; i < children.children.length; i++) {
          if (children.children[i].type == 'bin') {
            bin_ids.push(children.children[i]._id);
          }
        }
        let query_ = "";
        for (let i = 0; i < bin_ids.length; i++) {
          if (i == 0) {
            query_ += `AND "bin_id"='${bin_ids[i]}' `;
          } else {
            query += `OR "bin_id"='${bin_ids[i]}' `;
          }
        }
        influx_.query(`SELECT mean("fill") AS "fill" FROM "solidbits"."solidbits"."bin" WHERE time > now() - 30d ${query_}`).then(result => {
          io.emit('filled-bins-per-area', { place:parent, value:result[0].fill ? result[0].fill.toFixed(2) : null });
        });
      }
    });
  }

  let biggestWasteProducers = function() {
    Business.find({}).lean().exec(function(err, result) {
      if (result) {
        let parent = result[0].children[0].name;
        let bin_ids = [];
        let children = result[0].children[0];
        for (let i = 0; i < children.children.length; i++) {
          if (children.children[i].type == 'bin') {
            bin_ids.push(children.children[i]._id);
          }
        }
        let query_ = "";
        for (let i = 0; i < bin_ids.length; i++) {
          if (i == 0) {
            query_ += `AND "bin_id"='${bin_ids[i]}' `;
          } else {
            query += `OR "bin_id"='${bin_ids[i]}' `;
          }
        }
        influx_.query(`SELECT mean("fill") AS "fill" FROM "solidbits"."solidbits"."bin" WHERE time > now() - 30d ${query_}`).then(result => {
          io.emit('biggest-waste-producers', { place: parent, value: result[0].fill ? 100 : null });
        });
      }
    });
  }

  let mapData = function() {
    Business.find({}).lean().exec(function(err, result_business) {
      if (result_business) {
        influx_.query(`SELECT mean("weight") AS "weight" FROM "solidbits"."solidbits"."bin" WHERE time > now() - 2m`).then(result => {
          let status;
          if (result[0].weight) {
            if (result[0].weight != null) {
              status = 1;
            } else {
              status = 0;
            }
          }
          io.emit('map-data', {coordinates: result_business[0].children[0].children[0].coordinates, status: status});
        });
      }
    })
  }
}