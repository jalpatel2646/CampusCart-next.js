import { created, readJson, withApi } from "@/lib/http";
import { ServiceError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validation/auth";
import { validationDetails } from "@/lib/validation/server";
import { startSellerSession } from "@/lib/session";
import { serializeSeller } from "@/lib/serializers";
import { registerSeller } from "@/services/auth.service";

export const POST = withApi(async (request) => {
  rateLimit(request, { name: "signup", limit: 10, windowMs: 60 * 60 * 1000 });

  const parsed = signupSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    throw new ServiceError("Please check your details", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: validationDetails(parsed.error),
    });
  }

  const seller = await registerSeller(parsed.data);
  await startSellerSession(seller._id);

  return created(serializeSeller(seller), "Welcome to CampusCart");
});
