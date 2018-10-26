var mongoose = require('mongoose');

module.exports = function() {
  var schema = mongoose.Schema({
    clientId:{
      type: String,
      required: true
    },
    messageId:{
      type: String,
      required: false
    },
    payload:{
      temperature:{
        type: Number,
        required: false
      },
      humidity:{
        type: Number,
        required: false
      },
      fill:{
        type: Number,
        required: false
      },
      volume:{
        type: Number,
        required: false
      },
      weight:{
        type: Number,
        required: false
      },
      isLidEvent:{
        type: Boolean,
        required: false,
      },
      lidOpenedDuration: {
        type: Number,
        required: false
      },
      isLidOpened:{
        type: Boolean,
        required: false
      }
    }
  }, {
    timestamps: { createdAt: 'created', updatedAt: 'updated' }
  });
  return mongoose.model('MQTTMessage', schema);
}();