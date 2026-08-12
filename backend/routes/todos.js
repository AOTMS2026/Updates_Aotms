const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const { authMiddleware } = require('../middleware/auth');

// Create Todo
router.post('/', authMiddleware, async (req, res) => {
    try {
        const todo = new Todo({ ...req.body, owner: req.user.id });
        await todo.save();
        res.status(201).json(todo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Todos
router.get('/', authMiddleware, async (req, res) => {
    try {
        const filter = { $or: [{ owner: req.user.id }, { assignedTo: req.user.id }] };
        if (req.query.type) filter.type = req.query.type;
        if (req.query.status) filter.status = req.query.status;

        const todos = await Todo.find(filter).populate('assignedTo', 'name');
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Todo
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.body.status === 'COMPLETED' && !req.body.completedDate) {
            req.body.completedDate = new Date();
        }
        const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(todo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Todo
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
