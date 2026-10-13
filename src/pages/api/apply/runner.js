import { adminAuth, adminDb } from "../../../lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { saveBase64Image } from "../../../lib/storageUpload";
import { extractMyKad } from "../../../lib/mykadOcr";
import { ensureUserBootstrap } from "../../../lib/bootstrapUser";
import {
  PENDING_APPLICATION_MESSAGE,
  cleanText,
  isDateString,
  checkPhotos,
  hasPendingApplication,
} from "../../../lib/applyValidation";

export const config = {
  api: {
    bodyParser: { sizeLimit: "20mb" },
  },
};

// type key -> Firestore field on rider_applications (padan
// rider_registration_page.dart:627-672).
const PHOTO_FIELD_MAP = {
  ic_front: "icPhotoUrl",
  ic_back: "icBackPhotoUrl",
  license_front: "licensePhotoUrl",
  license_back: "licenseBackPhotoUrl",
  selfie: "selfiePhotoUrl",
  avatar_passport: "avatarPhotoUrl",
  roadtax: "roadtaxPhotoUrl",
  insurance: "insurancePhotoUrl",
  vehicle_photo: "vehiclePhotoUrl",
  payment_qr: "paymentQrUrl",
};

// Required text field -> maximum length.
const TEXT_FIELDS = {
  fullName: 120,
  icNumber: 20,
  emergencyName: 120,
  emergencyPhone: 20,
  vehicleType: 40,
  vehiclePlate: 20,
  vehicleModel: 80,
  bankName: 80,
  bankAccountNumber: 40,
  bankHolderName: 120,
  parlimen: 80,
  dun: 80,
};

const DATE_FIELDS = ["licenseExpiryDate", "roadtaxExpiryDate", "insuranceExpiryDate"];

function extractBase64(dataUrl) {
  const match = typeof dataUrl === "string" && dataUrl.match(/^data:image\/[a-z]+;base64,(.+)$/);
  return match ? match[1] : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization || "";
  const bearerMatch = authHeader.match(/^Bearer (.+)$/);
  if (!bearerMatch) {
    return res.status(401).json({ error: "Sila sahkan nombor telefon anda dahulu." });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(bearerMatch[1]);
  } catch {
    return res.status(401).json({ error: "Token tidak sah atau tamat tempoh." });
  }
  // Any account in the shared Firebase project yields a valid token; only
  // one that went through phone OTP carries a verified number.
  if (!decoded.phone_number) {
    return res.status(401).json({ error: "Sila sahkan nombor telefon anda dahulu." });
  }

  const body = req.body || {};
  const photos = body.photos || {};

  const text = {};
  for (const [field, maxLen] of Object.entries(TEXT_FIELDS)) {
    text[field] = cleanText(body[field], maxLen);
    if (!text[field]) {
      return res.status(400).json({ error: `Medan wajib tiada atau tidak sah: ${field}` });
    }
  }
  for (const field of DATE_FIELDS) {
    if (!isDateString(body[field])) {
      return res.status(400).json({ error: `Tarikh tidak sah: ${field}` });
    }
  }
  if (body.hasNoCriminalRecord !== true || body.isFitToWork !== true) {
    return res.status(400).json({ error: "Sila sahkan semua akuan & terma perkhidmatan." });
  }
  const photoError = checkPhotos(photos, Object.keys(PHOTO_FIELD_MAP));
  if (photoError) {
    return res.status(400).json({ error: photoError });
  }

  const uid = decoded.uid;

  if (await hasPendingApplication("rider_applications", uid)) {
    return res.status(409).json({ error: PENDING_APPLICATION_MESSAGE });
  }

  await ensureUserBootstrap(uid, {
    name: text.fullName,
    phone: decoded.phone_number,
  });

  const photoUrls = {};
  for (const [type, field] of Object.entries(PHOTO_FIELD_MAP)) {
    const path = `rider_docs/${uid}/${type}_${uid}_${Date.now()}`;
    photoUrls[field] = await saveBase64Image(photos[type], path);
  }

  let icOcrVerified = false;
  const icBase64 = extractBase64(photos.ic_front);
  if (icBase64) {
    try {
      const ocrResult = await extractMyKad(icBase64);
      if (ocrResult.success) {
        const typedIc = text.icNumber.replace(/-/g, "");
        icOcrVerified = ocrResult.icNumber === typedIc;
      }
    } catch (err) {
      console.error("MyKad OCR failed:", err);
    }
  }

  const applicationRef = await adminDb.collection("rider_applications").add({
    uid,
    email: "",
    ...text,
    vehiclePlate: text.vehiclePlate.toUpperCase(),
    phone: decoded.phone_number,
    licenseExpiryDate: Timestamp.fromDate(new Date(body.licenseExpiryDate)),
    roadtaxExpiryDate: Timestamp.fromDate(new Date(body.roadtaxExpiryDate)),
    insuranceExpiryDate: Timestamp.fromDate(new Date(body.insuranceExpiryDate)),
    ...photoUrls,
    hasNoCriminalRecord: true,
    isFitToWork: true,
    status: "PENDING",
    createdAt: FieldValue.serverTimestamp(),
    source: "public_web",
    icOcrVerified,
  });

  await adminDb.collection("admin_notifications").add({
    title: "Permohonan Runner Baru",
    body: `${text.fullName} memohon menjadi Runner DNA63.`,
    type: "NEW_RIDER_APP",
    isSeen: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  return res.status(201).json({ success: true, applicationId: applicationRef.id });
}
