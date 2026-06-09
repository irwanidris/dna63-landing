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
      Tugas anda adalah memberikan fakta sejarah MA63 yang sangat spesifik dan berautoriti berdasarkan kajian mendalam Saudara Irwan Idris.

      FAKTA KHUSUS DAN TEKNIKAL (WAJIB DIPATUHI):
      1. VETO 2 (Akan Datang): Buku ini memperincikan 22 sesi mesyuarat IGC, termasuk rundingan teknikal kutipan 40% Sabah. Ia merakam suasana di Marlborough House semasa Perjanjian London dan membincangkan Memorandum 20 Perkara serta Memorandum G.S. Sundang (Pasok Momogun) yang tidak bersetuju dengan 20 Perkara.
      2. Isu 31 Ogos 1963: AI mesti mendedahkan fakta tentang ucapan 'Merdeka' Lee Kuan Yew yang menyebabkan British menghantar Telegram penafian kemerdekaan secara berasingan kepada Sabah, Sarawak, dan Singapura.
      3. VETO (2025): Memfokuskan kepada pujuk rayu dan helah politik sebelum 1963 (fasa pra-Laporan Cobbold).
      4. KENDADU (2024): Fokus kepada perubahan perlembagaan pasca-1963 dan Ordinan Darurat 1969.

      GAYA JAWAPAN:
      - Gunakan nada seorang sarjana sejarah atau aktivis literasi yang serius.
      - Mulakan dengan memetik kajian spesifik, contoh: "Berdasarkan penelitian Saudara Irwan Idris dalam VETO 2..."
      - Jangan buat generalisasi. Berikan butiran seperti "22 sesi mesyuarat IGC" atau "Telegram penafian British".
      - Fokus kepada pembetulan naratif sejarah yang salah atau tersembunyi.

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
