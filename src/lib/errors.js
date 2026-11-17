/**
 * Shared service-layer error type.
 * Services throw these so API route handlers (Phase 2) can map them to HTTP
 * responses without leaking Mongo/Mongoose internals.
 */
export class ServiceError extends Error {
  constructor(message, { statusCode = 500, code = "SERVICE_ERROR", details } = {}) {
    super(message);
    this.name = "ServiceError";
    this.statusCode = statusCode;
    this.code = code;
    if (details) this.details = details;
  }
}

export function isDuplicateKeyError(error) {
  return error?.code === 11000 || error?.code === 11001;
}

/**
 * Converts Mongoose/Mongo errors into a consistent ServiceError.
 * Duplicate keys → 409, validation → 400 (with field messages), cast → 400.
 */
export function normalizeError(error, fallbackMessage = "Database operation failed") {
  if (error instanceof ServiceError) return error;

  if (isDuplicateKeyError(error)) {
    const field = Object.keys(error.keyPattern ?? {})[0];
    return new ServiceError(
      field ? `A record with that ${field} already exists` : "Duplicate record",
      { statusCode: 409, code: "DUPLICATE_KEY", details: error.keyValue }
    );
  }

  if (error?.name === "ValidationError") {
    const details = Object.values(error.errors ?? {}).map((item) => item.message);
    return new ServiceError(details[0] ?? "Validation failed", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details,
    });
  }

  if (error?.name === "CastError") {
    return new ServiceError(`Invalid value for "${error.path}"`, {
      statusCode: 400,
      code: "INVALID_VALUE",
    });
  }

  return new ServiceError(fallbackMessage, {
    statusCode: 500,
    code: "DATABASE_ERROR",
    details: error?.message ? [error.message] : undefined,
  });
}
