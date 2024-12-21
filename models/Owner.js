const mongoose = require('mongoose');

// Define the schema for master data
const masterDataSchema = new mongoose.Schema({
  owner: {
    ownerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task", // Reference to Task model
      },
    ],
    masters: [
      {
        masterID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to User model (master)
          unique: true,
        },
        superAdmins: [
          {
            superAdminID: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User", // Reference to User model (super admin)
            },
            tasks: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task", // Reference to Task model
              },
            ],
          },
        ],
        tasks: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task", // Reference to Task model
          },
        ],
      },
    ],
  },
});

// Ensure masterIDs are unique within the masters array
masterDataSchema.path("owner.masters").validate(function (masters) {
  const uniqueIds = new Set(masters.map((master) => master.masterID.toString()));
  return uniqueIds.size === masters.length;
}, "Duplicate masterID found within the masters array");

// Create the model from the schema
const masterData = mongoose.model("masterData", masterDataSchema);

// Export the model
module.exports = { masterData };
