// src/routes/authRoutes.js
const express = require("express");
const { register, login } = require("../controller/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Protected route (accessible only to specific roles)
router.get(
  "/admin",
  protect,
  authorize("owner", "superadmin", "admin"),
  (req, res) => {
    res.status(200).json({ message: "Welcome Admin!" });
  }
);

module.exports = router;
