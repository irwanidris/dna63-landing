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

    // Carian Konteks yang sangat spesifik
    const findBestContext = (query, base) => {
      const q = query.toLowerCase();
      // Force match untuk kata kunci kritikal
      if (q.includes("20") || q.includes("dua puluh")) {
        return base.knowledge_base.find(i => i.topic.includes("20"))?.content;
      }
      if (q.includes("ma63")) {
        return base.knowledge_base.find(i => i.topic.includes("MA63"))?.content;
      }

      // Fallback carian biasa
      const match = base.knowledge_base.find(item => {
        const topic = item.topic.toLowerCase();
        return q.split(' ').some(word => word.length > 4 && topic.includes(word));
      });
      return match ? match.content : "";
    };

    const relevantContext = findBestContext(message, kbData);

    const systemPrompt = `
      PERANAN: Anda adalah DNA63 AI, pembantu teknikal untuk literasi perlembagaan Sabah.

      ARAHAN UTAMA (WAJIB PATUH):
      1. ANDA HANYA BOLEH MENJAWAB BERDASARKAN "KONTEKS RUJUKAN" DI BAWAH.
      2. JANGAN GUNAKAN PENGETAHUAN LUAR ANDA (Terutamanya jangan sebut pasal PKMM, Malaya 1947, atau fakta internet lain).
      3. JIKA MAKLUMAT TIADA DALAM KONTEKS, JAWAB: "Maaf, fakta sejarah khusus mengenai ini boleh didapati di dalam koleksi buku DNA63."
      4. 20 PERKARA ADALAH MEMORANDUM SABAH 1962, BUKAN PERJANJIAN, BUKAN DARI MALAYA.

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
          { role: "user", content: `Berdasarkan konteks rujukan sahaja, ${message}` }
        ],
        temperature: 0.0,
        max_tokens: 200,
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
