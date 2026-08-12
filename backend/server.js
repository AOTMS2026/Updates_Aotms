const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Log API requests
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const tasksRoutes = require('./routes/tasks');
const reportsRoutes = require('./routes/reports');
const todosRoutes = require('./routes/todos');
const issuesRoutes = require('./routes/issues');
const remindersRoutes = require('./routes/reminders');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/reminders', remindersRoutes);

app.get('/', (req, res) => {
    res.send('AOTMS Backend Running');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aotms').then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
