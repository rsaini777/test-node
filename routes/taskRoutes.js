// src/routes/taskRoutes.js
const express = require("express");
const { initializeTasks, viewTasks, assignTasksToMasterById ,assignTasksToSuperAdminById} = require("../controller/taskController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Owner can initialize tasks
router.post("/initialize", protect, authorize("owner"), initializeTasks);

// View tasks (role-based)
router.get("/view", protect, viewTasks);

// Assign tasks (owner -> master -> superadmin -> admin)
router.put("/assign/master/:masterId", protect,authorize("owner"), assignTasksToMasterById);
router.put("/assign/superAdmin/:superAdminId", protect,authorize("master"), assignTasksToMasterById);

module.exports = router;
