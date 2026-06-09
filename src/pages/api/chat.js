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

    // Carian hanya pada SATU topik yang paling relevan sahaja
    const findBestContext = (query, base) => {
      const keywords = query.toLowerCase().split(' ');
      const matches = base.knowledge_base
        .filter(item => {
          const topic = item.topic.toLowerCase();
          return keywords.some(word => word.length > 3 && topic.includes(word));
        });

      // Ambil yang pertama sahaja untuk elakkan info-dumping
      return matches.length > 0 ? matches[0].content : "";
    };

    const relevantContext = findBestContext(message, kbData);

    const systemPrompt = `
      Anda adalah DNA63 AI. Jawab soalan dengan SANGAT RINGKAS DAN TERUS (Strictly 1-2 perenggan sahaja).

      PERATURAN MUTLAK:
      1. JANGAN sebut buku VETO, KENDADU, atau IGC jika tidak ditanya secara spesifik.
      2. JANGAN buat rumusan atau ulasan tambahan di hujung jawapan.
      3. Jika maklumat tiada dalam konteks di bawah, jawab: "Maaf, sila rujuk buku-buku DNA63 untuk maklumat lanjut."
      4. Gunakan gaya bahasa fakta yang kering dan tepat.

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
        temperature: 0.0, // Kosongkan terus supaya tiada kreativiti
        max_tokens: 150,  // Hadkan jumlah perkataan
      }),
    });

    const data = await response.json();
    const answer = data.choices[0].message.content;

    res.status(200).json({ answer: answer });

  } catch (error) {
    console.error("RAG Error:", error);
    res.status(500).json({ message: "Ralat pada sistem AI", error: error.message });
  }
}
