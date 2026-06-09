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

    const findRelevantContext = (query, base) => {
      const keywords = query.toLowerCase().split(' ');
      return base.knowledge_base
        .filter(item => {
          const content = (item.topic + " " + item.content).toLowerCase();
          return keywords.some(word => word.length > 2 && content.includes(word));
        })
        .map(item => item.content)
        .join('\n\n');
    };

    const relevantContext = findRelevantContext(message, kbData);

    const systemPrompt = `
      Anda adalah Pembantu AI DNA63 (Tanya DNA63).
      Tugas anda adalah memberikan jawapan yang RINGKAS, TEPAT, dan PADAT berdasarkan kajian Saudara Irwan Idris.

      PERATURAN JAWAPAN (WAJIB):
      1. JAWAB APA YANG DITANYA SAHAJA: Jika ditanya "Apa itu MA63", jelaskan definisinya sahaja. Jangan sebut tentang 22 sesi IGC atau Lee Kuan Yew kecuali ditanya.
      2. LAYERED KNOWLEDGE: Simpan fakta-fakta teknikal (seperti Telegram British, Marlborough House, atau G.S. Sundang) untuk soalan yang spesifik mengenainya.
      3. MAKSIMUM 2-3 PERENGGAN: Jangan beri jawapan panjang lebar. Pengguna mahu jawapan yang mudah dibaca.
      4. NADA: Serius dan berilmu, seperti seorang pakar yang menjawab dengan tenang.
      5. RUJUKAN: Sebutkan buku rujukan secara ringkas di hujung jawapan jika perlu sebagai pengukuh fakta.

      KONTEKS DNA63:
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
        temperature: 0.1,
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
