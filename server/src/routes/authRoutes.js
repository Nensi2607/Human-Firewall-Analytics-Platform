const express = require("express");
const { body } = require("express-validator");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
  "/register",
  [
    body("firstName").notEmpty(),
    body("lastName").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty(),
  ],
  validate,
  login
);

router.get("/me", protect, getMe);

module.exports = router;