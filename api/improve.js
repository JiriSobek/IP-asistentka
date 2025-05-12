import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const prompt = ` 
Jsi jazyková redaktorka a zkušená sociální pracovnice. Pomáháš upravit text v individuálním plánu tak, aby byl stylisticky lepší a srozumitelnější, ale významově zůstal úplně stejný.

Přepiš následující text tak, aby:
- byl jednodušší, přirozený a snadno srozumitelný i pro člověka se základním vzděláním,
- působil přívětivě, lidsky a profesionálně,
- měl plynulou větnou stavbu, bez zbytečně dlouhých nebo kostrbatých vět,
- neobsahoval pokud možno cizí výrazy, odborná slova, úřednický nebo formální styl,
- neobsahoval žádné HTML ani vysvětlivky,
- a zachoval všechny důležité informace beze změny nebo vynechání.

Neměň smysl vět, nepřidávej žádné domněnky ani nové informace.  
Výstup vrať jako čistý, přepsaný text bez komentářů.

Text k úpravě:
"""${text}"""

    `;
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    });
    const improved = chat.choices[0].message.content;
    res.status(200).json({ text: improved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru při volání OpenAI" });
  }
}
