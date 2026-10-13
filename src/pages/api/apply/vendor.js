import crypto from "crypto";
import { adminAuth, adminDb } from "../../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { saveBase64Image } from "../../../lib/storageUpload";
import { ensureUserBootstrap } from "../../../lib/bootstrapUser";
import {
  PENDING_APPLICATION_MESSAGE,
  cleanText,
  isDateString,
  isTimeString,
  checkPhotos,
  hasPendingApplication,
} from "../../../lib/applyValidation";

export const config = {
  api: {
    bodyParser: { sizeLimit: "20mb" },
  },
};

const PACKAGES = {
  pakej1: { amount: 120, targetTierKey: "loyalty", name: "Pakej 1 - Program Cop Digital" },
  pakej2: { amount: 240, targetTierKey: "menu", name: "Pakej 2 - Menu Digital & Katalog" },
  pakej3: { amount: 360, targetTierKey: "marketing", name: "Pakej 3 - Marketing & Broadcast Promo" },
};

// Required text field -> maximum length.
const TEXT_FIELDS = {
  businessName: 120,
  description: 500,
  whatsapp: 20,
  category: 60,
  address: 300,
  mykadName: 120,
  icNumber: 30,
};

const DATE_FIELDS = ["paymentDate", "verifiedPaymentDate"];
const TIME_FIELDS = ["paymentTime", "verifiedPaymentTime"];
const DAYS = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"];

/** Rebuilds businessHours from known days and fields only, or null if malformed. */
function cleanBusinessHours(input) {
  if (!input || typeof input !== "object") return null;
  const hours = {};
  for (const day of DAYS) {
    const d = input[day];
    if (!d || typeof d.isOpen !== "boolean" || !isTimeString(d.open) || !isTimeString(d.close)) return null;
    hours[day] = { isOpen: d.isOpen, open: d.open, close: d.close };
  }
  return hours;
}

// Padan VendorPinHelper.hash() (DNA63_V2/lib/core/utils/vendor_pin_helper.dart)
// bit-per-bit -- kalau tak padan, PIN vendor takkan valid dalam app mobile.
function hashVendorPin(pin, uid) {
  return crypto.createHash("sha256").update(`${uid}:${pin}:dna63-vendor-pin`).digest("hex");
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
  for (const field of TIME_FIELDS) {
    if (!isTimeString(body[field])) {
      return res.status(400).json({ error: `Masa tidak sah: ${field}` });
    }
  }
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const hasCoords = body.lat !== "" && body.lat != null && body.lng !== "" && body.lng != null;
  if (!hasCoords || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return res.status(400).json({ error: "Lokasi gerai/premis tidak sah." });
  }
  const businessHours = cleanBusinessHours(body.businessHours);
  if (!businessHours) {
    return res.status(400).json({ error: "Masa operasi tidak sah." });
  }
  if (body.idType !== "mykad" && body.idType !== "passport") {
    return res.status(400).json({ error: "Jenis dokumen pengenalan tidak sah." });
  }
  const ssmNumber = body.ssmNumber ? cleanText(body.ssmNumber, 40) : "";
  if (ssmNumber === null) {
    return res.status(400).json({ error: "No. Pendaftaran SSM tidak sah." });
  }
  const passportCountry = body.idType === "passport" ? cleanText(body.passportCountry, 60) : "";
  if (passportCountry === null) {
    return res.status(400).json({ error: "Sila isi Negara Pengeluar Passport." });
  }
  if (!photos.shopPhoto) {
    return res.status(400).json({ error: "Gambar premis/gerai wajib." });
  }
  if (!photos.resitPhoto) {
    return res.status(400).json({ error: "Resit pembayaran wajib." });
  }
  if (typeof body.pin !== "string" || !/^\d{6}$/.test(body.pin.trim())) {
    return res.status(400).json({ error: "PIN mestilah 6-digit." });
  }
  const pkg = Object.hasOwn(PACKAGES, body.selectedPackage) ? PACKAGES[body.selectedPackage] : null;
  if (!pkg) {
    return res.status(400).json({ error: "Pakej tidak sah." });
  }
  if (!body.agreedToVerifiedTerms) {
    return res.status(400).json({ error: "Sila bersetuju dengan Terma & Syarat Verifikasi." });
  }
  if (!photos.mykadPhoto) {
    return res.status(400).json({ error: `Gambar ${body.idType === "passport" ? "Passport" : "MyKad"} wajib.` });
  }
  if (!photos.verifiedResitPhoto) {
    return res.status(400).json({ error: "Resit bayaran Verified (RM50) wajib." });
  }
  const photoKeys = ["shopPhoto", "resitPhoto", "mykadPhoto", "verifiedResitPhoto", ...(photos.ssmPhoto ? ["ssmPhoto"] : [])];
  const photoError = checkPhotos(photos, photoKeys);
  if (photoError) {
    return res.status(400).json({ error: photoError });
  }

  const uid = decoded.uid;

  if (await hasPendingApplication("vendor_applications", uid)) {
    return res.status(409).json({ error: PENDING_APPLICATION_MESSAGE });
  }

  await ensureUserBootstrap(uid, {
    name: text.businessName,
    phone: decoded.phone_number,
  });

  const shopPhotoUrl = await saveBase64Image(photos.shopPhoto, `vendor_docs/${uid}_shop`);
  const ssmPhotoUrl = photos.ssmPhoto ? await saveBase64Image(photos.ssmPhoto, `vendor_docs/${uid}_ssm`) : "";
  const resitPhotoUrl = await saveBase64Image(photos.resitPhoto, `vendor_docs/${uid}_resit`);

  // Padan verified_form_page.dart:_uploadToStorage (folder mykads/passports ikut idType).
  const idFolder = body.idType === "passport" ? "passports" : "mykads";
  const mykadPhotoUrl = await saveBase64Image(photos.mykadPhoto, `verified_requests/${idFolder}/${uid}_${Date.now()}`);
  const verifiedResitPhotoUrl = await saveBase64Image(photos.verifiedResitPhoto, `verified_requests/resits/${uid}_${Date.now()}`);

  const applicationRef = await adminDb.collection("vendor_applications").add({
    uid,
    email: "",
    ...text,
    ssmNumber,
    lat,
    lng,
    shopPhotoUrl,
    ssmPhotoUrl,
    resitPhotoUrl,
    selectedPackage: body.selectedPackage,
    packageName: pkg.name,
    targetTierKey: pkg.targetTierKey,
    amount: pkg.amount,
    paymentDate: body.paymentDate,
    paymentTime: body.paymentTime,
    vendorPinHash: hashVendorPin(body.pin.trim(), uid),
    status: "PENDING",
    createdAt: FieldValue.serverTimestamp(),
    businessHours,
    source: "public_web",
    idType: body.idType,
    passportCountry,
    mykadPhotoUrl,
    verifiedPaymentDate: body.verifiedPaymentDate,
    verifiedPaymentTime: body.verifiedPaymentTime,
    verifiedResitPhotoUrl,
    verifiedAmount: 50,
  });

  await adminDb.collection("admin_notifications").add({
    title: `Permohonan Vendor Baru & Bayaran ${pkg.name}`,
    body: `${text.businessName} mendaftar sebagai Vendor (${pkg.name} - RM ${pkg.amount}/tahun). Sila sahkan resit.`,
    type: "NEW_VENDOR_APP",
    isSeen: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  return res.status(201).json({ success: true, applicationId: applicationRef.id });
}
