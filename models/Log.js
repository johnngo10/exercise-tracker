const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  log: [
    {
      description: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    },
  ],
  // description: {
  //   type: String,
  //   required: true,
  // },
  // duration: {
  //   type: Number,
  //   required: true,
  // },
  // date: {
  //   type: Date,
  //   required: true,
  // },
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
