const express = require('express');
const router = express.Router();
const DailyUpdate = require('../models/DailyUpdate');
const DailyReport = require('../models/DailyReport');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Submit daily update
router.post('/updates', authMiddleware, async (req, res) => {
    try {
        // Find if user already submitted today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        let update = await DailyUpdate.findOne({
            user: req.user.id,
            date: { $gte: startOfDay, $lt: endOfDay }
        });

        if (update) {
            update = await DailyUpdate.findByIdAndUpdate(update._id, req.body, { new: true });
        } else {
            update = new DailyUpdate({ ...req.body, user: req.user.id });
            await update.save();
        }
        res.json(update);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user's daily updates
router.get('/updates', authMiddleware, async (req, res) => {
    try {
        const updates = await DailyUpdate.find({ user: req.user.id }).sort('-date');
        res.json(updates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate daily report (Manager/Admin only)
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const updates = await DailyUpdate.find({ date: { $gte: startOfDay, $lt: endOfDay } });
        
        let overallProgress = 0;
        if (updates.length > 0) {
            const totalProgress = updates.reduce((sum, update) => sum + (update.progressPercentage || 0), 0);
            overallProgress = totalProgress / updates.length;
        }

        const report = new DailyReport({
            date: new Date(),
            overallCompletion: overallProgress,
            userUpdates: updates.map(u => u._id)
        });

        await report.save();
        res.status(201).json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get reports
router.get('/', authMiddleware, async (req, res) => {
    try {
        const reports = await DailyReport.find().populate({
            path: 'userUpdates',
            populate: { path: 'user', select: 'name' }
        }).sort('-date');
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
