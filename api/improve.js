import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const prompt = ` 
Přepiš následující text tak, aby byl srozumitelný, plynulý a zněl jako běžná mluvená nebo psaná čeština. Piš přirozenou, pěknou češtinou bez cizích slov a odborných termínů. Zachovej význam, ale klidně změň větnou stavbu, rozděl nebo spoj věty, aby text působil přirozeně:
"${text}"
Výsledek bez HTML formátování.
    `;
    const chat = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [{ role: "user", content: prompt }]
    });
    const improved = chat.choices[0].message.content;
    res.status(200).json({ text: improved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru při volání OpenAI" });
  }
}
