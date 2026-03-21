const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  time: { type: String, default: null },
  topic: { type: String, required: true }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
