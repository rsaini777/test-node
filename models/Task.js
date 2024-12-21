// src/models/Task.js
const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { 
    type: String, 
    enum: ["owner", "master", "superadmin", "admin"], 
    default: "owner" 
  },
});

module.exports = mongoose.model("Task", TaskSchema);




