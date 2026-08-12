const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    feature: { type: mongoose.Schema.Types.ObjectId, ref: 'Feature' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'], default: 'TODO' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    type: { type: String, enum: ['TASK', 'EXECUTION_POINT'], default: 'TASK' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
