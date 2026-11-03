const AppError = require("../utils/AppError");

/* =========================
   DB / Mongoose Errors
========================= */

const handleCastErrorDB = () => {
  return new AppError("Invalid ID", 400);
};

const handleValidationErrorDB = () => {
  return new AppError("Invalid data", 400);
};

const handleDuplicateFieldsDB = () => {
  return new AppError("Duplicate field value", 400);
};

/* =========================
   Global Error Middleware
========================= */

const errorHandlerMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // ================= DB ERRORS =================
  if (err.name === "CastError") error = handleCastErrorDB();
  if (err.name === "ValidationError") error = handleValidationErrorDB();
  if (err.code === 11000) error = handleDuplicateFieldsDB();

  // ================= JWT ERRORS =================
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Token expired", 401);
  }

  // ================= DEFAULT VALUES =================
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  // ================= RESPONSE =================
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    console.error("ERROR 💥", error);

    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = errorHandlerMiddleware;