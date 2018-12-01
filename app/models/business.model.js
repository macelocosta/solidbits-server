var mongoose = require('mongoose');

module.exports = function() {
  var schema = mongoose.Schema({
    name:{
      type: String,
      required: true,
      min: 4
    },
    abbrev:{
      type: String,
      required: false,
      min: 2
    },
    location:{
      type: String,
      required: false,
      min: 2
    },
    children:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Node',
      required: false
    }
  }, {
    timestamps: { createdAt: 'created', updatedAt: 'updated' }
  });
  return mongoose.model('Business', schema);
}();