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
router.get("/", protect, authorize("admin"), getUsers);

router.get("/:id", protect, authorize("admin"), getUser);

router.put("/:id", protect, authorize("admin"), updateUser);

router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;