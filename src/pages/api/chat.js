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

    const findBestContext = (query, base) => {
      const q = query.toLowerCase();

      // 1. Prioriti match untuk IGC
      if (q.includes("igc") || q.includes("intergovernmental committee")) {
        return base.knowledge_base.find(i => i.topic.includes("IGC"))?.content;
      }

      // 2. Prioriti match untuk tarikh kritikal 31 Julai 1962
      if (q.includes("31 julai 1962") || q.includes("31 july 1962")) {
        return base.knowledge_base.find(i => i.topic.includes("31 Julai 1962"))?.content;
      }

      // 3. Match spesifik lain
      if (q.includes("veto 2")) return base.knowledge_base.find(i => i.topic.toLowerCase().includes("veto 2"))?.content;
      if (q.includes("veto")) return base.knowledge_base.find(i => i.topic.toLowerCase().includes("veto (2025)"))?.content;
      if (q.includes("20 perkara") || q.includes("dua puluh")) return base.knowledge_base.find(i => i.topic.toLowerCase().includes("20 perkara"))?.content;
      if (q.includes("ma63")) return base.knowledge_base.find(i => i.topic.toLowerCase().includes("ma63"))?.content;

      // Fallback
      const match = base.knowledge_base.find(item => {
        const topic = item.topic.toLowerCase();
        return q.split(' ').some(word => word.length > 3 && topic.includes(word));
      });

      return match ? match.content : "";
    };

    const relevantContext = findBestContext(message, kbData);

    const systemPrompt = `
      PERANAN: Anda adalah DNA63 AI.

      ARAHAN UTAMA:
      1. Jawab SANGAT RINGKAS DAN PADAT berdasarkan KONTEKS RUJUKAN sahaja.
      2. Ikut naratif DNA63 secara verbatim (tepat).
      3. Jangan gunakan maklumat luar.
      4. Jika ditanya tentang IGC atau Intergovernmental Committee, gunakan definisi tentang Perjanjian Rahsia 31 Julai 1962 dan Annex A secara tepat.

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
        temperature: 0.0,
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
