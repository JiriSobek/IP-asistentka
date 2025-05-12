import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const prompt = ` 
Jsi zkušená sociální pracovnice a jazyková redaktorka. Pomáháš upravit texty v individuálních plánech tak, aby byly dobře čitelné, přirozené a přívětivé.

Přepiš následující text tak, aby:
- byl přehlednější, plynulejší a stylisticky čistší,
- zněl přirozeně, jednoduše a srozumitelně – jako běžný popis v individuálním plánu,
- zachoval všechny původní informace beze změny nebo vynechání,
- nepoužíval cizí výrazy, odborná slova ani úřední nebo akademický styl,
- nebyl delší než původní text (počtem znaků).

Nepřidávej nové informace ani nevysvětluj věci, které v textu nejsou.  
Nepřidávej žádné komentáře, vysvětlení ani hodnocení.

Text uprav tak, aby působil jako přirozeně napsaný popis od pečující pracovnice. Používej běžný přirozený jazyk.  
Výstup vrať jako čistý text bez HTML.

Text k úpravě:
"""${text}"""
    `;
    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.5,
      messages: [{ role: "user", content: prompt }]
    });
    const improved = chat.choices[0].message.content;
    res.status(200).json({ text: improved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru při volání OpenAI" });
  }
}
