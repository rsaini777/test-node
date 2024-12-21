// src/routes/taskRoutes.js
const express = require("express");
const { 
  initializeTasks, 
  viewTasks, 
  assignTasksToMaster,
  assignMasterTasksToSuperAdmin,
  createMasterForOwner,
  addSuperAdminToMasterData
} = require("../controller/taskController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Owner can initialize tasks
router.post("/initialize", protect, authorize("owner"), initializeTasks);

// View tasks (role-based)
router.get("/view", protect, viewTasks);

// Assign tasks (owner -> master -> superadmin -> admin)
router.post("/assign/master/:ownerId/:masterId", protect, assignTasksToMaster);
router.post("/assign/superAdmin/:ownerId/:masterId/:superAdminId", protect, assignMasterTasksToSuperAdmin);

// Create SuperAdmins for Master (only accessible by Master)
router.post("/master/:ownerId", protect, createMasterForOwner);
router.post("/superadmin/:masterId", protect, addSuperAdminToMasterData);

module.exports = router;
