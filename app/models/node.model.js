var mongoose = require('mongoose');

module.exports = function() {
  var schema = mongoose.Schema({
    name:{
      type: String,
      required: true,
      min: 4
    },
    type:{
      type: String,
      required: true,
      min: 4
    },
    status:{
      type: Number,
      required: false,
    },
    coordinates:{
      type: Object,
      required: false
    },
    floor:{
      type: Number,
      required: false
    }
  }, {
    timestamps: { createdAt: 'created', updatedAt: 'updated' }
  });

  return mongoose.model('Node', schema);
}();