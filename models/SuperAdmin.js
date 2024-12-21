// src/models/SuperAdmin.js
const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema({
  superAdminID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Refers to the User model for SuperAdmins
    required: true,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task", // Refers to Task schema
    },
  ],
});

module.exports = mongoose.model("SuperAdmin", superAdminSchema);
