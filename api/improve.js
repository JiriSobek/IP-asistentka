import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const prompt = ` 
Přepiš následující text do plynulé, přirozené a pěkné češtiny, vhodné pro profesionální, ale lidskou komunikaci. Zachovej význam, ale zlepši větnou stavbu, aby text zněl srozumitelně, jemně a přirozeně. Případně rozděl nebo spoj věty pro lepší plynulost. Nepoužívej cizí slova, odborné výrazy ani HTML. Piš tak, aby text působil uceleně a přívětivě:
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
