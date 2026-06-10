import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { message } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!message) {
    return res.status(400).json({ message: "Mesej diperlukan" });
  }

  try {
    const kbPath = path.join(process.cwd(), 'src/data/dna63_framework.json');
    const kbData = JSON.parse(fs.readFileSync(kbPath, 'utf8'));

    // Carian Konteks yang sangat tepat mengikut naratif DNA63
    const findBestContext = (query, base) => {
      const q = query.toLowerCase();

      // Force match untuk buku VETO 2 dahulu supaya tak keliru dengan VETO 1
      if (q.includes("veto 2")) {
        return base.knowledge_base.find(i => i.topic.toLowerCase().includes("veto 2"))?.content;
      }
      if (q.includes("veto")) {
        return base.knowledge_base.find(i => i.topic.toLowerCase().includes("veto (2025)"))?.content;
      }
      if (q.includes("20 perkara") || q.includes("dua puluh")) {
        return base.knowledge_base.find(i => i.topic.toLowerCase().includes("20 perkara"))?.content;
      }
      if (q.includes("ma63")) {
        return base.knowledge_base.find(i => i.topic.toLowerCase().includes("ma63"))?.content;
      }
      if (q.includes("kendadu")) {
        return base.knowledge_base.find(i => i.topic.toLowerCase().includes("kendadu"))?.content;
      }
      if (q.includes("surat dari london") || q.includes("london")) {
        return base.knowledge_base.find(i => i.topic.toLowerCase().includes("london"))?.content;
      }

      // Fallback carian kata kunci
      const match = base.knowledge_base.find(item => {
        const topic = item.topic.toLowerCase();
        return q.split(' ').some(word => word.length > 3 && topic.includes(word));
      });

      return match ? match.content : "";
    };

    const relevantContext = findBestContext(message, kbData);

    const systemPrompt = `
      PERANAN: Anda adalah DNA63 AI, wakil digital bagi perjuangan literasi hak perlembagaan Sabah.

      ARAHAN UTAMA:
      1. Anda WAJIB menjawab menggunakan KONTEKS RUJUKAN di bawah.
      2. Gunakan ayat yang diberikan dalam KONTEKS RUJUKAN secara hampir verbatim (bulat-bulat) untuk definisi buku atau sejarah.
      3. JANGAN menambah ulasan "buku ini sangat berguna" atau ulasan umum AI yang lain.
      4. JANGAN sesekali keliru antara VETO (Buku 1) dan VETO 2. Ikut perincian dalam rujukan.
      5. Jika maklumat tiada dalam rujukan, jawab: "Maaf, perincian sejarah ini boleh didapati di dalam koleksi buku DNA63."

      KONTEKS RUJUKAN:
      ${relevantContext}
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.0, // Strict adherence to context
        max_tokens: 400,
      }),
    });

    const data = await response.json();
    const answer = data.choices[0]?.message?.content || "Maaf, sila rujuk buku-buku DNA63.";

    res.status(200).json({ answer: answer });

  } catch (error) {
    console.error("RAG Error:", error);
    res.status(500).json({ message: "Ralat pada sistem AI", error: error.message });
  }
}
