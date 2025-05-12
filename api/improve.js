import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;

    const systemMessage = `
Jsi zkušená pracovnice v sociálních službách. Pomáháš kolegyním upravit texty v individuálních plánech klientů tak, aby byly dobře čitelné, jednoduché, srozumitelné a lidské. Mluvíš česky, přirozeně a bez odborných nebo cizích slov. Používáš běžný jazyk. Víš, jak pečující personál běžně popisuje pomoc – píšeš jazykem, kterému porozumí i člověk se základním vzděláním. Neakademizuješ, nepoužíváš formální ani úřednický styl.
    `;

    const userPrompt = `
Přepiš následující text tak, aby byl přehlednější, jednodušší a stylisticky přirozený.  
Používej jazyk běžný v sociálních službách – konkrétní, srozumitelný a lidský.  
Nepřidávej žádné nové informace ani vysvětlení.  
Nepoužívej cizí slova, odborné výrazy ani formální styl.  
Zachovej všechny původní informace.  
Uprav text tak, aby nebyl delší než původní.  
Nepiš žádný úvod ani závěr, vrať jen čistý upravený text.

Text:
"""${text}"""

Výsledek:
    `;

    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.5,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ]
    });

    const improved = chat.choices[0].message.content;
    res.status(200).json({ text: improved });
  } catch (err) {
    console.error("Chyba při volání OpenAI:", err);
    res.status(500).json({ error: "Chyba serveru při volání OpenAI" });
  }
}
