// src/models/MasterData.js
const mongoose = require("mongoose");

const masterDataSchema = new mongoose.Schema({
  owner: {
    ownerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Refers to the User model for Owners
      required: true,
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task", // Refers to Task schema
      },
    ],
    masters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Master", // Refers to the Master schema
      },
    ],
  },
});
masterDataSchema.path("owner.masters").validate(function (masters) {
    const uniqueIds = new Set(masters.map((master) => master.masterID.toString()));
    return uniqueIds.size === masters.length;
  }, "Duplicate masterID found within the masters array");

module.exports = mongoose.model("MasterData", masterDataSchema);
