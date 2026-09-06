import crypto from "crypto";
import { adminAuth, adminDb } from "../../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { saveBase64Image } from "../../../lib/storageUpload";
import { ensureUserBootstrap } from "../../../lib/bootstrapUser";

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

const REQUIRED_FIELDS = [
  "businessName",
  "description",
  "whatsapp",
  "category",
  "address",
  "lat",
  "lng",
  "selectedPackage",
  "paymentDate",
  "paymentTime",
  "pin",
  "businessHours",
  "idType",
  "mykadName",
  "icNumber",
  "verifiedPaymentDate",
  "verifiedPaymentTime",
];

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

  const body = req.body || {};
  const photos = body.photos || {};

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return res.status(400).json({ error: `Medan wajib tiada: ${field}` });
    }
  }
  if (!photos.shopPhoto) {
    return res.status(400).json({ error: "Gambar premis/gerai wajib." });
  }
  if (!photos.resitPhoto) {
    return res.status(400).json({ error: "Resit pembayaran wajib." });
  }
  if (String(body.pin).length < 6) {
    return res.status(400).json({ error: "PIN mestilah 6-digit." });
  }
  const pkg = PACKAGES[body.selectedPackage];
  if (!pkg) {
    return res.status(400).json({ error: "Pakej tidak sah." });
  }
  if (body.idType === "passport" && !body.passportCountry) {
    return res.status(400).json({ error: "Sila isi Negara Pengeluar Passport." });
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

  const uid = decoded.uid;

  await ensureUserBootstrap(uid, {
    name: body.businessName,
    phone: decoded.phone_number || "",
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
    businessName: String(body.businessName).trim(),
    description: String(body.description).trim(),
    whatsapp: String(body.whatsapp).trim(),
    ssmNumber: body.ssmNumber ? String(body.ssmNumber).trim() : "",
    category: String(body.category).trim(),
    address: String(body.address).trim(),
    lat: Number(body.lat),
    lng: Number(body.lng),
    shopPhotoUrl,
    ssmPhotoUrl,
    resitPhotoUrl,
    selectedPackage: body.selectedPackage,
    packageName: pkg.name,
    targetTierKey: pkg.targetTierKey,
    amount: pkg.amount,
    paymentDate: body.paymentDate,
    paymentTime: body.paymentTime,
    vendorPinHash: hashVendorPin(String(body.pin).trim(), uid),
    status: "PENDING",
    createdAt: FieldValue.serverTimestamp(),
    businessHours: body.businessHours,
    source: "public_web",
    idType: body.idType,
    mykadName: String(body.mykadName).trim(),
    icNumber: String(body.icNumber).trim(),
    passportCountry: body.idType === "passport" ? String(body.passportCountry || "").trim() : "",
    mykadPhotoUrl,
    verifiedPaymentDate: body.verifiedPaymentDate,
    verifiedPaymentTime: body.verifiedPaymentTime,
    verifiedResitPhotoUrl,
    verifiedAmount: 50,
  });

  await adminDb.collection("admin_notifications").add({
    title: `Permohonan Vendor Baru & Bayaran ${pkg.name}`,
    body: `${body.businessName} mendaftar sebagai Vendor (${pkg.name} - RM ${pkg.amount}/tahun). Sila sahkan resit.`,
    type: "NEW_VENDOR_APP",
    isSeen: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  return res.status(201).json({ success: true, applicationId: applicationRef.id });
}
