var mongoose = require('mongoose');

module.exports = function() {
  var schema = mongoose.Schema({
    clientId:{
      type: String,
      required: true
    },
    event:{
      type: String,
      required: false
    }
  }, {
    timestamps: { createdAt: 'created', updatedAt: 'updated' }
  });
  return mongoose.model('MQTTEvent', schema);
}();