import { ok, readJson, withApi } from "@/lib/http";
import { ServiceError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation/auth";
import { validationDetails } from "@/lib/validation/server";
import { startSellerSession } from "@/lib/session";
import { serializeSeller } from "@/lib/serializers";
import { authenticateSeller } from "@/services/auth.service";

export const POST = withApi(async (request) => {
  rateLimit(request, { name: "login", limit: 15, windowMs: 15 * 60 * 1000 });

  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    throw new ServiceError("Please check your details", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: validationDetails(parsed.error),
    });
  }

  const seller = await authenticateSeller(parsed.data);
  await startSellerSession(seller._id);

  return ok(serializeSeller(seller), { message: "Signed in" });
});
