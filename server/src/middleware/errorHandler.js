const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError" || err.name === "CastError") {
    statusCode = 400;
    message = "The request could not be validated.";
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists.";
  }

  if (statusCode >= 500) {
    message = "Internal Server Error";
    console.error("Unhandled API error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

module.exports = errorHandler;