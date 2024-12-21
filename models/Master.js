// src/models/Master.js
const mongoose = require("mongoose");

const masterSchema = new mongoose.Schema({
  masterID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Refers to the User model for Masters
    required: true,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task", // Refers to Task schema
    },
  ],
  superAdmins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin", // Refers to the SuperAdmin schema
    },
  ],
});

module.exports = mongoose.model("Master", masterSchema);

