import { ServiceError } from "@/lib/errors";

export const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL?.trim() || "baidu/ernie-5.5-flash-preview:free";

export const isOpenRouterEnabled = Boolean(process.env.OPENROUTER_API_KEY?.trim());

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const TIMEOUT_MS = 20000;

async function readErrorDetails(response) {
  try {
    const text = await response.text();
    return [text.slice(0, 240)];
  } catch {
    return [`OpenRouter returned ${response.status}`];
  }
}

/**
 * Calls an OpenRouter chat completion, exactly once, with a hard timeout.
 * Errors are surfaced as ServiceError so routes can map them to a stable
 * API error shape. Returns the message content (may be empty for reasoning
 * models that hit the token budget; callers must treat that as an error).
 */
export async function callOpenRouter(messages, { maxTokens = 320, temperature = 0.3 } = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new ServiceError(
      "AI assist is not configured on this server (OPENROUTER_API_KEY is missing)",
      { statusCode: 503, code: "ASSIST_UNAVAILABLE" }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL?.trim() ||
          "https://github.com/jalpatel2646/CampusCart-next.js",
        "X-Title": "CampusCart",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ServiceError("AI assist timed out. Try again.", {
        statusCode: 504,
        code: "ASSIST_TIMEOUT",
      });
    }
    throw new ServiceError(error?.message || "AI assist request failed", {
      statusCode: 502,
      code: "ASSIST_FAILED",
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const details = await readErrorDetails(response);
    throw new ServiceError(
      response.status === 429
        ? "AI assist is rate-limited right now. Try again shortly."
        : "AI assist could not complete. Try again shortly.",
      { statusCode: response.status === 429 ? 429 : 502, code: "ASSIST_FAILED", details }
    );
  }

  const data = await response.json().catch(() => null);
  const text = data?.choices?.[0]?.message?.content;

  if (typeof text !== "string" || !text.trim()) {
    throw new ServiceError("AI assist returned an empty response. Try again.", {
      statusCode: 502,
      code: "ASSIST_EMPTY",
    });
  }

  return text.trim();
}
