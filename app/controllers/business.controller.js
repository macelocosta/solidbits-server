const Business = require('./../models/business.model');
const Node = require('./../models/node.model');
const errorHandler = require('./../controllers/error-handler.controller');

exports.getBusiness = function(req, res) {
  try {
    Business.find({}, function(err, result) {
      if (err) {
        errorHandler.answerWithError(err, req, res);
      } else {
        console.log(result);
        res.status(200).json(result);
      }
    });
  } catch (err) {
    throw err;
  }
}

exports.updateBusiness = function(req, res) {
  try {
    Business.find({}, function(err, result) {
      if (err) {
        errorHandler.answerWithError(err, req, res);
      } else {
        if (result.length > 0) {
          try {
            result = result[0];
            Business.findOneAndUpdate({_id:result._id}, {$set:{name:req.body.name, abbrev:req.body.abbrev, location:req.body.location, children:req.body.children}}, function(err, result) {
              if (err) {
                errorHandler.answerWithError(err, req, res);
              } else {
                res.status(201).json({message:"updated"});
              }
            });
          } catch (error) {
            throw error;
          }        
        } else {
          try {
            let business = new Business({
              name: req.body.name,
              abbrev: req.body.abbrev,
              location: req.body.location
            });
            business.save(function(err, business_) {
              if (err) {
                errorHandler.answerWithError(err, req, res);
              } else {
                res.status(200).json({message: 'ok'});
              }
            });
          } catch (error) {
            throw error;
          }
        }
      }
    });
  } catch (err) {
    throw err;
  }
}

// exports.addArea = function(req, res) {
//   Business.find({}).lean().exec(function(err, result) {
//     if (err) {
//       errorHandler.answerWithError(err, req, res);
//     } else {
//       let business = result;
//       let node = new Node({
//         name: req.body.name,
//         type: 'space',
//         parent: business
//       });
//       node.save();
//     }
//   });
// }