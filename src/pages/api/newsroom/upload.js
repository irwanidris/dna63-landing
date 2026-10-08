import { randomUUID } from "crypto";
import { adminStorage } from "../../../lib/firebaseAdmin";
import { withNewsroomAuth } from "../../../lib/newsroomAuth";
import { jpegSize, checkCoverImage } from "../../../lib/storageUpload";

export const config = {
  api: {
    bodyParser: { sizeLimit: "8mb" },
  },
};

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function handler(req, res, user) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { dataUrl, kind } = req.body || {};
  const match = typeof dataUrl === "string" && dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ error: "Imej tidak sah." });
  }

  const [, mimeType, base64] = match;
  const ext = ALLOWED_TYPES[mimeType];
  if (!ext) {
    return res.status(400).json({ error: "Jenis fail tidak disokong. Guna JPG, PNG, WEBP atau GIF." });
  }

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > 6 * 1024 * 1024) {
    return res.status(400).json({ error: "Saiz imej mesti bawah 6MB." });
  }

  // Cover images are resized to JPEG in the browser (see ArticleForm); the
  // limits are re-checked here and the width is stored for the publish check.
  const metadata = { contentType: mimeType, cacheControl: "public, max-age=31536000, immutable" };
  if (kind === "cover") {
    const size = mimeType === "image/jpeg" ? jpegSize(buffer) : null;
    if (!size) {
      return res.status(400).json({ error: "Gambar utama mesti dalam format JPG." });
    }
    const problem = checkCoverImage({ bytes: buffer.length, type: mimeType, width: size.width });
    if (problem) {
      return res.status(400).json({ error: problem });
    }
    metadata.metadata = { width: String(size.width), height: String(size.height) };
  }

  const filename = `news-images/${user.uid}/${Date.now()}-${randomUUID()}.${ext}`;
  const file = adminStorage.bucket().file(filename);

  await file.save(buffer, { metadata });
  await file.makePublic();

  const publicUrl = `https://storage.googleapis.com/${adminStorage.bucket().name}/${filename}`;
  return res.status(201).json({ url: publicUrl });
}

export default withNewsroomAuth(handler);
