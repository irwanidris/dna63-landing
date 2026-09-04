import { randomUUID } from "crypto";
import { adminStorage } from "../../../lib/firebaseAdmin";
import { withNewsroomAuth } from "../../../lib/newsroomAuth";

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

  const { dataUrl } = req.body || {};
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

  const filename = `news-images/${user.uid}/${Date.now()}-${randomUUID()}.${ext}`;
  const file = adminStorage.bucket().file(filename);

  await file.save(buffer, {
    metadata: { contentType: mimeType, cacheControl: "public, max-age=31536000, immutable" },
  });
  await file.makePublic();

  const publicUrl = `https://storage.googleapis.com/${adminStorage.bucket().name}/${filename}`;
  return res.status(201).json({ url: publicUrl });
}

export default withNewsroomAuth(handler);
