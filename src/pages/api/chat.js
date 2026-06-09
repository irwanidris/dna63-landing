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

    // Carian Konteks yang lebih dinamik
    const findBestContext = (query, base) => {
      const q = query.toLowerCase();

      // 1. Prioriti match untuk kata kunci spesifik
      if (q.includes("veto 2")) return base.knowledge_base.find(i => i.topic.toLowerCase().includes("veto 2"))?.content;
      if (q.includes("veto")) return base.knowledge_base.find(i => i.topic.toLowerCase().includes("veto (2025)"))?.content;
      if (q.includes("20 perkara") || q.includes("dua puluh")) return base.knowledge_base.find(i => i.topic.toLowerCase().includes("20 perkara"))?.content;
      if (q.includes("40%") || q.includes("empat puluh peratus")) return base.knowledge_base.find(i => i.topic.toLowerCase().includes("40%"))?.content;
      if (q.includes("ma63")) return base.knowledge_base.find(i => i.topic.toLowerCase().includes("ma63"))?.content;
      if (q.includes("kendadu")) return base.knowledge_base.find(i => i.topic.toLowerCase().includes("kendadu"))?.content;
      if (q.includes("surat dari london") || q.includes("london")) return base.knowledge_base.find(i => i.topic.toLowerCase().includes("london"))?.content;

      // 2. Carian fleksibel untuk perkataan lain
      const match = base.knowledge_base.find(item => {
        const topic = item.topic.toLowerCase();
        const content = item.content.toLowerCase();
        return q.split(' ').some(word => word.length > 2 && (topic.includes(word) || content.includes(word)));
      });

      return match ? match.content : "";
    };

    const relevantContext = findBestContext(message, kbData);

    const systemPrompt = `
      PERANAN: Anda adalah DNA63 AI, pakar sejarah MA63 dan perjuangan hak perlembagaan Sabah.

      KONTEKS RUJUKAN UTAMA:
      ${relevantContext}

      ARAHAN (SANGAT PENTING):
      1. Jika KONTEKS RUJUKAN di atas memberikan maklumat, anda WAJIB menjawab berdasarkan maklumat tersebut secara terperinci tetapi padat.
      2. Jangan sesekali menggunakan fakta sejarah umum dari internet yang bercanggah dengan rujukan di atas.
      3. JANGAN sebut tentang PKMM atau Malaya 1947 jika orang tanya pasal 20 Perkara. 20 Perkara adalah Memorandum Sabah 1962.
      4. Jika maklumat tiada dalam konteks tetapi soalan berkaitan DNA63 atau MA63, gunakan nada yang bijaksana: "Berdasarkan kerangka DNA63, perkara ini sering dikaitkan dengan perjuangan literasi hak kita. Walau bagaimanapun, perincian sejarah yang lebih mendalam boleh didapati di dalam siri buku VETO, KENDADU, dan MA63 TC."
      5. Jawab dalam Bahasa Melayu yang matang dan berautoriti.
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
        temperature: 0.2, // Naikkan sikit untuk "kebijaksanaan" bahasa, tetapi kekal faktual.
        max_tokens: 300,
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
