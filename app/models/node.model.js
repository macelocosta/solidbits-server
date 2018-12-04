var mongoose = require('mongoose');

mPathOptions = {
  pathSeparator: '#',
  onDelete: 'REPARENT',
  idType: mongoose.Schema.ObjectId
}

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
    location:{
      type:String,
      required: false
    }
  }, {
    timestamps: { createdAt: 'created', updatedAt: 'updated' }
  });

  return mongoose.model('Node', schema);
}();