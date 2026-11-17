import { connection } from "next/server";
import { ServiceError } from "@/lib/errors";

/**
 * Wraps a route handler so service/validation failures become consistent JSON.
 *
 * `connection()` is awaited outside the try/catch on purpose: Next uses its
 * special rejection to stop prerendering when a route needs request-time data.
 * Catching it would turn that signal into a fabricated 500 response.
 */
export function withApi(handler) {
  return async function apiHandler(...args) {
    await connection();

    try {
      return await handler(...args);
    } catch (error) {
      return apiError(error);
    }
  };
}

export function ok(data, { status = 200, message } = {}) {
  return Response.json(
    {
      success: true,
      ...(message ? { message } : {}),
      data,
    },
    { status }
  );
}

export function created(data, message) {
  return ok(data, { status: 201, message });
}

export function apiError(error) {
  if (error instanceof ServiceError) {
    const retryAfterSeconds = error?.retryAfterSeconds;
    return Response.json(
      {
        success: false,
        message: error.message,
        ...(error.details ? { errors: error.details } : {}),
        ...(Number.isFinite(retryAfterSeconds)
          ? { retryAfterSeconds }
          : {}),
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  console.error("[CampusCart API]", error);
  return Response.json(
    {
      success: false,
      message: "Something went wrong. Please try again.",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}

/** Reads and validates a JSON body without leaking parser details. */
export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ServiceError("Request body must be valid JSON", {
      statusCode: 400,
      code: "INVALID_JSON",
    });
  }
}

export function assertMethod(request, allowed) {
  if (!allowed.includes(request.method)) {
    throw new ServiceError("Method not allowed", {
      statusCode: 405,
      code: "METHOD_NOT_ALLOWED",
    });
  }
}
