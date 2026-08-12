const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    overallCompletion: { type: Number, default: 0 },
    userUpdates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DailyUpdate' }]
}, { timestamps: true });

module.exports = mongoose.model('DailyReport', dailyReportSchema);
