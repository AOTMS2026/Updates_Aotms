const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const { authMiddleware } = require('../middleware/auth');

// Create Reminder
router.post('/', authMiddleware, async (req, res) => {
    try {
        const reminder = new Reminder({ ...req.body, owner: req.user.id });
        await reminder.save();
        res.status(201).json(reminder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Reminders
router.get('/', authMiddleware, async (req, res) => {
    try {
        const filter = { owner: req.user.id };
        if (req.query.status) filter.status = req.query.status;

        const reminders = await Reminder.find(filter).sort('time');
        res.json(reminders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Reminder
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(reminder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Reminder
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Reminder.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
