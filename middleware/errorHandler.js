export function errorHandler(err, req, res, next) {
  // Log the error stack to the console for backend debugging
  console.error(err.stack);

  // Extract status code from error object or default to 500 (Internal Server Error)
  const statusCode = err.statusCode || err.status || 500;

  // Format a uniform JSON response
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}