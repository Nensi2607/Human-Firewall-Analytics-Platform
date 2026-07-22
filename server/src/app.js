const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HFAP Backend Running 🚀",
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
// Global Error Handler
app.use(errorHandler);

app.use("/api/health", require("./routes/healthRoutes"));

app.use("/api/departments", require("./routes/departmentRoutes"));

module.exports = app;