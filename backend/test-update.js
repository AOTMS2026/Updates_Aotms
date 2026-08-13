const mongoose = require('mongoose');
const Task = require('./models/Task');
const { MONGO_URI } = require('./config');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/aotms', { useNewUrlParser: true, useUnifiedTopology: true });
  const task = await Task.findOne({ type: 'EXECUTION_POINT' });
  if (task) {
    console.log("Old createdAt:", task.createdAt);
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 1);
    
    const updated = await Task.findByIdAndUpdate(task._id, { createdAt: newDate }, { new: true });
    console.log("New createdAt:", updated.createdAt);
  }
  process.exit();
}
run();
