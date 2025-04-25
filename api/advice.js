import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const prompt = `
Jsi odborník na sociální péči. Posuď následující text individuálního plánu:
"${text}"
Navrhni doporučení, jak text zlepšit (jasnost, empatie, konkrétnost). Odpověď ve formátu HTML, používej <b>tučný text</b> a odrážky <ul><li>.
    `;
    const chat = await openai.chat.completions.create({
      model: "gpt-4-0613",
      messages: [{ role: "user", content: prompt }]
    });
    const advice = chat.choices[0].message.content;
    res.status(200).json({ text: advice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru při volání OpenAI" });
  }
}
