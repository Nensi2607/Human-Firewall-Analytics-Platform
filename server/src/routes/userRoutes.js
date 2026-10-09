const express = require("express");

const {
  getCurrentUserProfile,
  updateMyProfile,
  changeMyPassword,
  getMyAdminSummary,
  getUsers,
  getUser,
  getEmployeeDetail,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getCurrentUserProfile);
router.patch("/me", protect, updateMyProfile);
router.patch("/me/password", protect, changeMyPassword);
router.get("/me/admin-summary", protect, authorize("admin"), getMyAdminSummary);

// Shared list for authenticated users; mutations remain admin-only.
router.get("/", protect, authorize("admin"), getUsers);

router.get("/:id/detail", protect, authorize("admin"), getEmployeeDetail);
router.get("/:id", protect, authorize("admin"), getUser);

router.put("/:id", protect, authorize("admin"), updateUser);

router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;