const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { authMiddleware } = require('../middleware/auth');

// Create Issue
router.post('/', authMiddleware, async (req, res) => {
    try {
        const issue = new Issue({ 
            ...req.body, 
            reportedBy: req.user.id,
            timeline: [{ user: req.user.id, action: 'Issue created' }] 
        });
        await issue.save();
        res.status(201).json(issue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Issues
router.get('/', authMiddleware, async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        
        const issues = await Issue.find(filter)
            .populate('reportedBy', 'name')
            .populate('assignedTo', 'name');
        res.json(issues);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Single Issue
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('reportedBy', 'name')
            .populate('assignedTo', 'name')
            .populate('timeline.user', 'name');
        res.json(issue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Timeline Comment/Update
router.post('/:id/timeline', authMiddleware, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ error: 'Issue not found' });
        
        issue.timeline.push({
            user: req.user.id,
            action: req.body.action
        });

        if (req.body.status) {
            issue.status = req.body.status;
            if (req.body.status === 'RESOLVED' && !issue.resolvedDate) {
                issue.resolvedDate = new Date();
            }
        }

        await issue.save();
        res.json(issue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
