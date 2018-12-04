const IncomingForm = require('formidable').IncomingForm;
const fs = require('fs');
const Business = require('./../models/business.model');
const errorHandler = require('./error-handler.controller');
var mkdirp = require('mkdirp');

exports.saveFile = function(req, res) {
  var form = new IncomingForm();
  let business_id;
  form.parse(req, function (err, fields, files) {
    Business.find({}, function(err, result) {
      if (err) {
        errorHandler.answerWithError(err, req, res);
      } else {
        business_id = result[0]._id;
        let floor = {
          name: fields.name,
          filename: files.file.name,
        }
        Business.findOneAndUpdate({_id: business_id}, {$push: { floors: floor }}, {new: true}, function(err, result) {
          if (err) {
            errorHandler.answerWithError(err, req, res);
          } else {
            if (!fs.existsSync('/solidbits-data/' + business_id + '/floors/')) {
              mkdirp('/solidbits-data/' + business_id + '/floors/', function(err) {
                if (err) {
                  errorHandler.answerWithError(err, req, res);
                } else {
                  var oldpath = files.file.path;
                  var newpath = '/solidbits-data/' + business_id + '/floors/' + files.file.name;
                  fs.rename(oldpath, newpath, function (err) {
                    if (err) throw err;
                    res.status(200).json({message: 'stored'});
                  });
                }
              });
            } else {
              var oldpath = files.file.path;
              var newpath = '/solidbits-data/' + business_id + '/floors/' + files.file.name;
              fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                res.status(200).json({message: 'stored'});
              });
            }
          }
        });
      }
    });
  });
}

exports.getFile = function(req, res) {

}

exports.removeFile = function(req, res) {

}

exports.getFloors = function(req, res) {
  Business.find({}, function(err, result) {
    if (err) {
      errorHandler.answerWithError(err, req, res);
    } else {
      res.status(200).json(result[0].floors);
    }
  });
}