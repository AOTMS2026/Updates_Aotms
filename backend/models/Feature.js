const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED'], default: 'PLANNED' }
}, { timestamps: true });

module.exports = mongoose.model('Feature', featureSchema);
