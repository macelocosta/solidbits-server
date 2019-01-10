const Node = require('./../models/node.model');
const errorHandler = require('./../controllers/error-handler.controller');

exports.preAddNode = function(req, res) {
  let node = new Node({
    name: req.body.name,
    type: 'bin',
    coordinates: req.body.coordinates,
    floor: req.body.floor
  });
  node.save(function(err, result) {
    if (err) {
      errorHandler.answerWithError(err, req, res);
    } else {
      res.status(200).json(result);
    }
  });
}