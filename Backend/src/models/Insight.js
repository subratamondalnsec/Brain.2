const mongoose = require('mongoose');

const InsightSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  text: { type: String, required: true },
  number: { type: Number }
});

module.exports = mongoose.model('Insight', InsightSchema);
