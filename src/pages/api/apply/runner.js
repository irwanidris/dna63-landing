import { adminAuth, adminDb } from "../../../lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { saveBase64Image } from "../../../lib/storageUpload";
import { extractMyKad } from "../../../lib/mykadOcr";
import { ensureUserBootstrap } from "../../../lib/bootstrapUser";

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

const REQUIRED_FIELDS = [
  "fullName",
  "icNumber",
  "emergencyName",
  "emergencyPhone",
  "vehicleType",
  "vehiclePlate",
  "vehicleModel",
  "bankName",
  "bankAccountNumber",
  "bankHolderName",
  "parlimen",
  "dun",
  "licenseExpiryDate",
  "roadtaxExpiryDate",
  "insuranceExpiryDate",
  "hasNoCriminalRecord",
  "isFitToWork",
];

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

  const body = req.body || {};
  const photos = body.photos || {};

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return res.status(400).json({ error: `Medan wajib tiada: ${field}` });
    }
  }
  if (!body.hasNoCriminalRecord || !body.isFitToWork) {
    return res.status(400).json({ error: "Sila sahkan semua akuan & terma perkhidmatan." });
  }
  for (const type of Object.keys(PHOTO_FIELD_MAP)) {
    if (!photos[type]) {
      return res.status(400).json({ error: `Gambar wajib tiada: ${type}` });
    }
  }

  const uid = decoded.uid;

  await ensureUserBootstrap(uid, {
    name: body.fullName,
    phone: decoded.phone_number || body.phone || "",
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
        const typedIc = String(body.icNumber).replace(/-/g, "");
        icOcrVerified = ocrResult.icNumber === typedIc;
      }
    } catch (err) {
      console.error("MyKad OCR failed:", err);
    }
  }

  const applicationRef = await adminDb.collection("rider_applications").add({
    uid,
    email: "",
    fullName: String(body.fullName).trim(),
    icNumber: String(body.icNumber).trim(),
    phone: decoded.phone_number || body.phone || "",
    emergencyName: String(body.emergencyName).trim(),
    emergencyPhone: String(body.emergencyPhone).trim(),
    vehicleType: body.vehicleType,
    vehiclePlate: String(body.vehiclePlate).trim().toUpperCase(),
    vehicleModel: String(body.vehicleModel).trim(),
    bankName: String(body.bankName).trim(),
    bankAccountNumber: String(body.bankAccountNumber).trim(),
    bankHolderName: String(body.bankHolderName).trim(),
    parlimen: String(body.parlimen).trim(),
    dun: String(body.dun).trim(),
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
    body: `${body.fullName} memohon menjadi Runner DNA63.`,
    type: "NEW_RIDER_APP",
    isSeen: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  return res.status(201).json({ success: true, applicationId: applicationRef.id });
}
