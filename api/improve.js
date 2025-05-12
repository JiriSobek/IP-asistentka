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
Pokud je pomoc popsána v infinitivu (např. Pomoc s koupelí), převeď větu do 3. osoby (např. Klient potřebuje pomoc s koupelí).  
Nepřidávej žádné nové informace ani vysvětlení.  
Nepoužívej cizí slova, odborné výrazy ani formální styl.  
Zachovej všechny původní informace.  
Uprav text tak, aby nebyl delší než původní.  
Nepiš žádný úvod ani závěr, vrať jen čistý upravený text.

Text:
"""${text}"""

Výsledek:
    `;

    const stream = await openai.beta.chat.completions.stream({
      model: "gpt-4o",
      temperature: 0.5,
      stream: true,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ]
    });

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache"
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (err) {
    console.error("Chyba při volání OpenAI:", err);
    res.status(500).send("Chyba serveru při volání OpenAI");
  }
}
