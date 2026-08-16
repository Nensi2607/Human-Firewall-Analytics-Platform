const express = require("express");

const {
  getCurrentUserProfile,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getCurrentUserProfile);

// Shared list for authenticated users; mutations remain admin-only.
router.get("/", protect, getUsers);

router.get("/:id", protect, getUser);

router.put("/:id", protect, authorize("admin"), updateUser);

router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;