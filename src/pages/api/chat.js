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

    // Carian Konteks yang lebih tepat
    const findBestContext = (query, base) => {
      const q = query.toLowerCase();
      // Cari tajuk yang paling sepadan
      const match = base.knowledge_base.find(item => {
        const topic = item.topic.toLowerCase();
        // Check for specific numbers or key phrases
        if (q.includes("20") && topic.includes("20")) return true;
        if (q.includes("ma63") && topic.includes("ma63")) return true;
        if (q.includes("veto") && topic.includes("veto")) return true;
        if (q.includes("kendadu") && topic.includes("kendadu")) return true;
        return q.split(' ').some(word => word.length > 4 && topic.includes(word));
      });
      return match ? match.content : "";
    };

    const relevantContext = findBestContext(message, kbData);

    const systemPrompt = `
      Anda adalah DNA63 AI. Anda WAJIB menjawab menggunakan KONTEKS RUJUKAN di bawah.

      PERATURAN KERAS:
      1. JANGAN gunakan pengetahuan umum anda tentang Malaysia/Sabah jika ia bercanggah dengan KONTEKS RUJUKAN.
      2. JANGAN panggil 20 Perkara sebagai "Perjanjian" atau "Signed Agreement". Ia adalah MEMORANDUM.
      3. Jawab dalam 1-2 perenggan sahaja. Terus kepada fakta.
      4. Jika soalan tiada kaitan dengan konteks, jawab: "Maaf, sila rujuk buku-buku DNA63 untuk fakta sejarah yang sahih."

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
        max_tokens: 180,
      }),
    });

    const data = await response.json();
    const answer = data.choices[0]?.message?.content || "Maaf, berlaku ralat teknikal.";

    res.status(200).json({ answer: answer });

  } catch (error) {
    console.error("RAG Error:", error);
    res.status(500).json({ message: "Ralat pada sistem AI", error: error.message });
  }
}
