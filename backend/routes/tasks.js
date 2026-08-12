const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Feature = require('../models/Feature');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Create a feature
router.post('/features', authMiddleware, async (req, res) => {
    try {
        const feature = new Feature(req.body);
        await feature.save();
        res.status(201).json(feature);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all features
router.get('/features', authMiddleware, async (req, res) => {
    try {
        const features = await Feature.find().populate('project');
        res.json(features);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a feature
router.put('/features/:id', authMiddleware, async (req, res) => {
    try {
        const feature = await Feature.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!feature) return res.status(404).json({ error: 'Feature not found' });
        res.json(feature);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a feature
router.delete('/features/:id', authMiddleware, async (req, res) => {
    try {
        await Feature.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a task
router.post('/', authMiddleware, async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get tasks (can filter by assignedTo or feature)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const filter = {};
        if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
        if (req.query.feature) filter.feature = req.query.feature;
        if (req.query.type) filter.type = req.query.type;
        
        if (req.query.date) {
            const startOfDay = new Date(req.query.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(req.query.date);
            endOfDay.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }
        
        const tasks = await Task.find(filter).populate('assignedTo', 'name email').populate('feature', 'title');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a task (status, progress)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
