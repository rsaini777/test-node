const User = require("../models/User");
const Task = require("../models/Task");
const { masterData } = require("../models/Owner");




exports.initializeTasks = async (req, res) => {
  try {
    // Define tasks to be created
    const tasks = [
      { title: "Task 1", description: "Description 1" },
      { title: "Task 2", description: "Description 2" },
      { title: "Task 3", description: "Description 3" },
      { title: "Task 4", description: "Description 4" },
      { title: "Task 5", description: "Description 5" },
      { title: "Task 6", description: "Description 6" },
      { title: "Task 7", description: "Description 7" },
      { title: "Task 8", description: "Description 8" },
      { title: "Task 9", description: "Description 9" },
      { title: "Task 10", description: "Description 10" },
    ];

    // Insert tasks into the database
    const createdTasks = await Task.insertMany(
      tasks.map((task) => ({ ...task }))
    );

    // Find the owner user by their role
    const owner = await User.findOne({ role: "owner" });

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }
    console.log(owner._id)
    // Save the task assignments to the TaskAssignment model
    const taskAssignment = new masterData({
      owner: {
        ownerID: owner._id,
        tasks: createdTasks
      }
    });

    // Save the task assignment to the database
    await taskAssignment.save();

    // Send response with owner ID and created tasks
    res.status(201).json({
      taskAssignment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error initializing tasks" });
  }
};


// View tasks based on role
exports.viewTasks = async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

exports.createMasterForOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { email } = req.body;

    // Find the user by their email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with the provided email" });
    }
    user.role = 'master';
    await user.save();
    const master = await User.findById(ownerId);
    if (!master || master.role.toLowerCase() !== "owner") {
      return res.status(400).json({ message: "Invalid Master ID or user is not a Master" });
    }
    let masterDocs = await masterData.find({})
    let masterDoc = await masterData.findOne({ 'owner.ownerID': ownerId })
    console.log("old data",masterDocs)
    console.log("old data for",masterDoc)
    if (!masterDoc) {
      masterDoc = new masterData({
        owner: {
          ownerID: ownerId,
          masters: [{
            masterID: user._id,
          }],
          
        }
      });
    } else {
      masterDoc.owner.masters.push({
        masterID: user._id,
        tasks: []
      });
    }
    await masterDoc.save();

    res.status(201).json({
      masterDoc,
      message: "Master created successfully and linked to Master",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating SuperAdmins", error: error.message });
  }
};


exports.addSuperAdminToMasterData = async (req, res) => {
  try {
    const { masterId } = req.params; // The master ID
    const { email } = req.body; // The superadmin's email

    // Find the user by their email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with the provided email" });
    }

    // Update user role to 'superadmin'
    user.role = "superadmin";
    await user.save();

    // Find the master in the masterData schema
    let masterDoc = await masterData.findOne({ "owner.masters.masterID": masterId });
    if (!masterDoc) {
      return res.status(404).json({ message: "Master data not found for the given masterId" });
    }

    // Find the specific master entry in the masters array
    const masterEntry = masterDoc.owner.masters.find(
      (master) => master.masterID.toString() === masterId.toString()
    );

    if (!masterEntry) {
      return res
        .status(404)
        .json({ message: "Master entry not found in the owner's masterData" });
    }

    // Check if the superadmin already exists for this master
    const isSuperAdminExists = masterEntry.superAdmins.some(
      (admin) => admin.superAdminID.toString() === user._id.toString()
    );

    if (isSuperAdminExists) {
      return res
        .status(400)
        .json({ message: "SuperAdmin already assigned to this Master" });
    }

    // Add the superadmin to the master
    masterEntry.superAdmins.push({
      superAdminID: user._id,
      tasks: [],
    });

    // Save the updated masterData document
    await masterDoc.save();

    // Populate the masterData document
    const populatedMasterDoc = await masterData
      .findById(masterDoc._id)
      .populate("owner.masters.masterID", "name email role")
    res.status(201).json({
      message: "SuperAdmin added successfully to the Master",
      masterDoc: populatedMasterDoc,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding SuperAdmin", error: error.message });
  }
};


exports.assignTasksToMaster = async (req, res) => {
  try {
    const { ownerId, masterId } = req.params; // Get ownerId and masterId from request params
    const { taskIds } = req.body; // Get task IDs from request body (array of ObjectIds)

    // Find the masterData entry for the owner
    const masterDoc = await masterData.findOne({ "owner.ownerID": ownerId });
    if (!masterDoc) {
      return res.status(404).json({ message: "Owner data not found" });
    }

    // Find the master entry within the owner's data
    const masterEntry = masterDoc.owner.masters.find(
      (master) => master.masterID.toString() === masterId
    );

    if (!masterEntry) {
      return res.status(404).json({ message: "Master not found under the given owner" });
    }

    // Check if all task IDs exist in the owner's tasks array
    const ownerTasks = masterDoc.owner.tasks || [];
    const tasksToAssign = ownerTasks.filter((taskId) => taskIds.includes(taskId.toString()));

    if (tasksToAssign.length !== taskIds.length) {
      return res.status(400).json({
        message: "Some tasks are not available in the owner's task list",
      });
    }

    // Assign the tasks to the master and remove them from the owner's tasks
    masterEntry.tasks.push(...tasksToAssign);

    // Remove assigned tasks from the owner's tasks array
    masterDoc.owner.tasks = ownerTasks.filter((taskId) => !taskIds.includes(taskId.toString()));

    // Save the updated masterData document
    await masterDoc.save();

    // Respond with the updated masterData document
    res.status(200).json({
      message: "Tasks successfully assigned to Master",
      masterDoc,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error assigning tasks to Master", error: error.message });
  }
};


exports.assignMasterTasksToSuperAdmin = async (req, res) => {
  try {
    const { ownerId, masterId, superAdminId } = req.params; 
    const { taskIds } = req.body; 

    if (!taskIds || !Array.isArray(taskIds)) {
      return res.status(400).json({ message: "Task IDs are required and should be an array" });
    }

    // Find the masterData entry for the owner
    const masterDoc = await masterData.findOne({ "owner.ownerID": ownerId });
    if (!masterDoc) {
      return res.status(404).json({ message: "Owner data not found" });
    }

    // Find the master entry within the owner's data
    const masterEntry = masterDoc.owner.masters.find(
      (master) => master.masterID._id.toString() === masterId
    );

    if (!masterEntry) {
      return res.status(404).json({ message: "Master not found under the given owner" });
    }

    // Find the superAdmin entry within the master's data
    const superAdminEntry = masterEntry.superAdmins.find(
      (superAdmin) => superAdmin.superAdminID.toString() === superAdminId
    );

    if (!superAdminEntry) {
      return res.status(404).json({ message: "SuperAdmin not found under the given master" });
    }

    // Assign the tasks to the superAdmin
    // Only add tasks from the request body that are in the masterEntry's tasks
    const validTasks = masterEntry.tasks.filter(taskId => taskIds.includes(taskId.toString()));
    if (validTasks.length === 0) {
      return res.status(400).json({ message: "No valid tasks found to assign to SuperAdmin" });
    }

    // Add valid tasks to the superAdmin's tasks array
    superAdminEntry.tasks.push(...validTasks);

    // Remove the assigned tasks from the masterEntry's tasks
    masterEntry.tasks = masterEntry.tasks.filter(taskId => !validTasks.includes(taskId));

    // Save the updated masterData document
    await masterDoc.save();

    // Respond with the updated masterData document
    res.status(200).json({
      message: "Selected tasks successfully assigned to SuperAdmin",
      masterDoc,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error assigning tasks to SuperAdmin", error: error.message });
  }
};
