import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();

/**
 * Port of DNA63_V2/functions/index.js processMyKadOCR (Cloud Vision text
 * detection + regex/heuristic extraction) to plain Node, for use from a
 * Next.js API route (Application Default Credentials, same as
 * firebaseAdmin.js on Firebase App Hosting).
 */
export async function extractMyKad(base64Image) {
  const [result] = await client.textDetection({ image: { content: base64Image } });
  const fullText = result.fullTextAnnotation?.text || "";
  const lines = fullText.split("\n").map((l) => l.trim()).filter((l) => l.length > 3);

  const myKadRegex = /\d{6}-?\d{2}-?\d{4}/;
  const icMatch = myKadRegex.exec(fullText.replace(/\s/g, ""));
  const icNumber = icMatch ? icMatch[0].replace(/-/g, "") : null;

  let detectedName = "";
  for (const line of lines) {
    if (line.toUpperCase().includes("WARGANEGARA")) continue;
    if (/\d/.test(line)) continue;
    if (line.length > 5 && line === line.toUpperCase()) {
      detectedName = line;
      break;
    }
  }

  return icNumber ? { success: true, icNumber, fullName: detectedName || "TIDAK DIKESAN" } : { success: false };
}
