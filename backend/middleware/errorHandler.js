/**
 * Middleware centralizado para el manejo de errores.
 * Captura todos los errores de la aplicación y devuelve una respuesta estandarizada.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  // En desarrollo podemos enviar el stack, pero en producción es mejor no hacerlo.
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
