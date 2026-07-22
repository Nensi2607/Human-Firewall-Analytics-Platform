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
} = require("../middleware/authMiddleware");

const {
  authorize,
} = require("../middleware/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("admin"), createDepartment)
  .get(protect, getDepartments);

router
  .route("/:id")
  .get(protect, getDepartment)
  .put(protect, authorize("admin"), updateDepartment)
  .delete(protect, authorize("admin"), deleteDepartment);

  router.put(
  "/:id/manager",
  protect,
  authorize("admin"),
  assignManager
);

module.exports = router;