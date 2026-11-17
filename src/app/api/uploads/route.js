import { created, withApi } from "@/lib/http";
import { ServiceError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { requireSellerSession } from "@/lib/session";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function uploadBuffer(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "campuscart/listings",
        resource_type: "image",
        public_id: undefined,
        filename_override: filename,
        transformation: [
          { width: 1600, height: 1600, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });
}

export const POST = withApi(async (request) => {
  rateLimit(request, { name: "upload", limit: 30, windowMs: 60 * 60 * 1000 });

  await requireSellerSession();

  if (!isCloudinaryConfigured) {
    throw new ServiceError(
      "Image uploads are not configured. Add the Cloudinary credentials to the server environment.",
      { statusCode: 503, code: "UPLOAD_UNAVAILABLE" }
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    throw new ServiceError("Upload a valid image file", {
      statusCode: 400,
      code: "INVALID_UPLOAD",
    });
  }

  const files = formData
    .getAll("files")
    .filter((file) => file && typeof file === "object" && typeof file.arrayBuffer === "function");

  if (files.length === 0) {
    throw new ServiceError("Choose at least one image", {
      statusCode: 400,
      code: "NO_FILES",
    });
  }
  if (files.length > MAX_FILES) {
    throw new ServiceError(`You can upload up to ${MAX_FILES} images at a time`, {
      statusCode: 400,
      code: "TOO_MANY_FILES",
    });
  }

  for (const file of files) {
    if (file.size === 0) {
      throw new ServiceError("One of the selected files is empty", {
        statusCode: 400,
        code: "EMPTY_FILE",
      });
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new ServiceError("Each image must be 5 MB or smaller", {
        statusCode: 400,
        code: "FILE_TOO_LARGE",
      });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new ServiceError("Images must be JPG, PNG, or WebP", {
        statusCode: 400,
        code: "UNSUPPORTED_FILE_TYPE",
      });
    }
  }

  try {
    const urls = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await uploadBuffer(buffer, file.name);
        if (!result?.secure_url) {
          throw new Error("Cloudinary returned no URL");
        }
        return result.secure_url;
      })
    );

    return created({ urls }, urls.length === 1 ? "Image uploaded" : "Images uploaded");
  } catch (error) {
    console.error("[CampusCart upload]", error);
    throw new ServiceError("The image could not be uploaded. Please try again.", {
      statusCode: 502,
      code: "UPLOAD_FAILED",
    });
  }
});
