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
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Node'
    },
    children: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Node'
    }]
  }, {
    timestamps: { createdAt: 'created', updatedAt: 'updated' }
  });
  return mongoose.model('Node', schema);
}();