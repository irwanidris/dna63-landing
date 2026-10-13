import { adminStorage } from "./firebaseAdmin";

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Limits for an article's cover image. The mobile app's server fetches it
// from the RSS <enclosure>, which needs a real image/* type, at least
// 800px wide and under 500 KB.
export const COVER_MAX_BYTES = 500 * 1024;
export const COVER_MIN_WIDTH = 800;
export const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Reads { width, height } from a JPEG's SOF header, or null if not a JPEG. */
export function jpegSize(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buffer.length) {
    if (buffer[i] !== 0xff) return null;
    const marker = buffer[i + 1];
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isSof) {
      return { height: buffer.readUInt16BE(i + 5), width: buffer.readUInt16BE(i + 7) };
    }
    i += 2 + buffer.readUInt16BE(i + 2);
  }
  return null;
}

/**
 * Looks up the stored size/type/width of a cover image previously uploaded
 * through api/newsroom/upload.js. Throws if the URL isn't one of ours.
 */
export async function getCoverImageInfo(url) {
  const bucket = adminStorage.bucket();
  const prefix = `https://storage.googleapis.com/${bucket.name}/news-images/`;
  if (typeof url !== "string" || !url.startsWith(prefix)) {
    throw new Error("Gambar utama mesti dimuat naik melalui newsroom.");
  }
  const path = decodeURIComponent(url.slice(prefix.length - "news-images/".length));
  let metadata;
  try {
    [metadata] = await bucket.file(path).getMetadata();
  } catch {
    throw new Error("Gambar utama tidak dijumpai. Sila muat naik semula.");
  }
  return {
    bytes: Number(metadata.size),
    type: metadata.contentType,
    width: Number(metadata.metadata?.width) || null,
  };
}

/** Returns a message for the author if the cover image breaks the limits, else null. */
export function checkCoverImage({ bytes, type, width }) {
  if (!COVER_TYPES.includes(type)) {
    return "Gambar utama mesti JPG, PNG atau WEBP.";
  }
  if (!bytes || bytes >= COVER_MAX_BYTES) {
    return "Gambar utama mesti bawah 500 KB. Sila muat naik semula.";
  }
  if (!width || width < COVER_MIN_WIDTH) {
    return `Gambar utama mesti sekurang-kurangnya ${COVER_MIN_WIDTH} piksel lebar. Sila muat naik semula.`;
  }
  return null;
}

/**
 * Saves a base64 data URL to Firebase Storage via the Admin SDK and returns
 * a public storage.googleapis.com URL. Admin SDK has no getDownloadURL(),
 * so makePublic() + the storage.googleapis.com URL form is what mobile's
 * Image.network(url) consumes (same pattern as api/newsroom/upload.js).
 */
export async function saveBase64Image(dataUrl, path, { maxBytes = 8 * 1024 * 1024 } = {}) {
  const { buffer, mimeType, ext } = decodeImageDataUrl(dataUrl, { maxBytes });

  const filename = `${path}.${ext}`;
  const file = adminStorage.bucket().file(filename);
  await file.save(buffer, {
    metadata: { contentType: mimeType, cacheControl: "public, max-age=31536000, immutable" },
  });
  await file.makePublic();

  return `https://storage.googleapis.com/${adminStorage.bucket().name}/${filename}`;
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** True if the bytes really start like the declared image type. */
function matchesImageType(buffer, mimeType) {
  if (mimeType === "image/jpeg") {
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return buffer.length > 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE);
  }
  if (mimeType === "image/webp") {
    return buffer.length > 12 && buffer.toString("latin1", 0, 4) === "RIFF" && buffer.toString("latin1", 8, 12) === "WEBP";
  }
  return false;
}

/**
 * Decodes a base64 image data URL and checks its declared type, size and
 * file signature. Throws an Error with a message for the applicant.
 */
export function decodeImageDataUrl(dataUrl, { maxBytes = 8 * 1024 * 1024 } = {}) {
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
  if (!matchesImageType(buffer, mimeType)) {
    throw new Error("Fail ini bukan imej yang sah.");
  }

  return { buffer, mimeType, ext };
}
