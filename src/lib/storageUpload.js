import { adminStorage } from "./firebaseAdmin";

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Saves a base64 data URL to Firebase Storage via the Admin SDK and returns
 * a public storage.googleapis.com URL. Admin SDK has no getDownloadURL(),
 * so makePublic() + the storage.googleapis.com URL form is what mobile's
 * Image.network(url) consumes (same pattern as api/newsroom/upload.js).
 */
export async function saveBase64Image(dataUrl, path, { maxBytes = 8 * 1024 * 1024 } = {}) {
  const match = typeof dataUrl === "string" && dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Imej tidak sah.");
  }

  const [, mimeType, base64] = match;
  const ext = ALLOWED_TYPES[mimeType];
  if (!ext) {
    throw new Error("Jenis fail tidak disokong. Guna JPG, PNG atau WEBP.");
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > maxBytes) {
    throw new Error(`Saiz imej mesti bawah ${Math.floor(maxBytes / (1024 * 1024))}MB.`);
  }

  const filename = `${path}.${ext}`;
  const file = adminStorage.bucket().file(filename);
  await file.save(buffer, {
    metadata: { contentType: mimeType, cacheControl: "public, max-age=31536000, immutable" },
  });
  await file.makePublic();

  return `https://storage.googleapis.com/${adminStorage.bucket().name}/${filename}`;
}
