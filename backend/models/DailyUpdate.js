const mongoose = require('mongoose');

const dailyUpdateSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    tasksCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    tasksInProgress: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    issues: [{ type: String }],
    progressPercentage: { type: Number, default: 0 },
    planForTomorrow: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DailyUpdate', dailyUpdateSchema);
