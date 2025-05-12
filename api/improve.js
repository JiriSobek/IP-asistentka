import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const prompt = ` 
Jsi jazyková redaktorka a zkušená sociální pracovnice. Pomáháš přepsat text tak, aby byl srozumitelný, gramaticky správný, přirozený a vhodný pro individuální plán v sociálních službách.

Přepiš následující text tak, aby:
- byl dobře čitelný, jednoduchý a přívětivý,
- zněl jako běžná, ale profesionální čeština bez úředního nebo technického stylu,
- zachoval všechny věcné informace,
- měl plynulou větnou stavbu – můžeš rozdělit nebo spojit věty, upravit slovosled nebo přeformulovat části tak, aby text lépe zněl,
- pokud to je možné, nepoužívej cizí slova, odborné výrazy ani HTML značky.

Nepiš nic navíc, nehodnoť text a výsledek vrať pouze jako čistý přepsaný text bez komentářů.

Text k úpravě:
"""${text}"""

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
