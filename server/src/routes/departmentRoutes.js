const express = require("express");

const {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  assignManager,
} = require("../controllers/departmentController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("admin"), createDepartment)
  .get(protect, authorize("admin"), getDepartments);

router
  .route("/:id")
  .get(protect, authorize("admin"), getDepartment)
  .put(protect, authorize("admin"), updateDepartment)
  .delete(protect, authorize("admin"), deleteDepartment);

  router.put(
  "/:id/manager",
  protect,
  authorize("admin"),
  assignManager
);

module.exports = router;