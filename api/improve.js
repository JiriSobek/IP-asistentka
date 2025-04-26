import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const prompt = `
Jsi jazykový poradce. Přeformuluj a vylepši následující text tak, aby byl maximálně srozumitelný, napsaný přirozeným jazykem, bez cizích slov a odborných termínů. Význam textu musí zůstat zachován. Když je text mlhavý, nic si nedomýšlej a proveď jen malé změny:
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
