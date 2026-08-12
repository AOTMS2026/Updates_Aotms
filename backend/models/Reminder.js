const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    title: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    time: { type: Date, required: true },
    repeat: { type: String, enum: ['ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'], default: 'ONE_TIME' },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
