const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    const details = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(", ");
    message = details || message;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists.";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format.";
  }

  const response = {
    status: "error",
    statusCode,
    message,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
