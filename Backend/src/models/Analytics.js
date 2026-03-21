const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  insights: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Insight' }],
  schedules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' }],
  transcriptions: [{ type: String }]
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
