const mongoose = require('mongoose');

const TaskAssignmentSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }
  ]
});

const TaskAssignment = mongoose.model('TaskAssignment', TaskAssignmentSchema);

module.exports={TaskAssignment}