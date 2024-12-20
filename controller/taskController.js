const User = require("../models/User");
const Task = require("../models/Task");

// Initialize tasks (Owner only)
exports.initializeTasks = async (req, res) => {
  try {
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

    const createdTasks = await Task.insertMany(
      tasks.map((task) => ({ ...task, assignedTo: "owner" }))
    );
    res.status(201).json(createdTasks);
  } catch (error) {
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


exports.assignTasksToMasterById = async (req, res) => {
  try {
    const { masterId } = req.params; 
    console.log("Master ID from params:", masterId);

    // Find the user by ID and check their role
    const master = await User.findById(masterId);

    if (!master || master.role !== "master") {
      return res.status(400).json({ message: "Invalid master ID or user is not a master" });
    }

    // Fetch tasks from the body
    const tasksToAssign = req.body.tasks; 
    if (!tasksToAssign|| tasksToAssign.length === 0) {
      return res.status(400).json({ message: "No tasks provided in the request" });
    }


    if (tasksToAssign.length === 0) {
      return res.status(400).json({ message: "No valid tasks available for assignment" });
    }

   
    const taskIds = tasksToAssign.map((task) => task._id);
    console.log(taskIds)
    for (let taskId of taskIds) {
      const updatedTask = await Task.findByIdAndUpdate(
        taskId, 
        { assignedTo: "master", assignedUser: master._id,  }, 
        { new: true } 
      );
      console.log(updatedTask)
    }
    const allTasks = await Task.find({});
    res.status(200).json({
      message: `Successfully assigned ${tasksToAssign.length} tasks to Master: ${master.name}`,
      tasks: allTasks  
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error assigning tasks" });
  }
};


exports.assignTasksToSuperAdminById = async (req, res) => {
  try {
    const { superAdminId } = req.params; 
    console.log("SuperAdmin ID from params:", superAdminId);
    const superAdmin = await User.findById(superAdminId);

    if (!superAdmin || superAdmin.role !== "superadmin") {
      return res.status(400).json({ message: "Invalid SuperAdmin ID or user is not a SuperAdmin" });
    }

    const tasksToAssign = req.body.tasks; 
    if (!tasksToAssign || tasksToAssign.length === 0) {
      return res.status(400).json({ message: "No tasks provided in the request" });
    }

    if (tasksToAssign.length === 0) {
      return res.status(400).json({ message: "No valid tasks available for assignment" });
    }

    const taskIds = tasksToAssign.map((task) => task._id);
    console.log(taskIds);

    // Update each task and assign it to the SuperAdmin
    for (let taskId of taskIds) {
      const updatedTask = await Task.findByIdAndUpdate(
        taskId, 
        { assignedTo: "superadmin", assignedUser: superAdmin._id },  
        { new: true } 
      );
      console.log(updatedTask)
    }

  
    const allTasks = await Task.find({});
    res.status(200).json({
      message: `Successfully assigned ${tasksToAssign.length} tasks to SuperAdmin: ${superAdmin.name}`,
      tasks: allTasks  
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error assigning tasks to SuperAdmin" });
  }
};

