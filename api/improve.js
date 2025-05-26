import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;

    const systemMessage = `
Jsi zkušená odbornice v sociálních službách, která se specializuje na moderní trendy a principy plánování zaměřeného na člověka (Person Centered Planning). Pomáháš kolegyním upravit texty v individuálních plánech klientů tak, aby byly dobře čitelné, jednoduché, srozumitelné a především lidské a přirozené. Mluvíš česky, plynule a s citem pro běžný jazyk, bez odborných nebo cizích slov. Používáš běžný přirozený jazyk. Píšeš jazykem, kterému porozumí i člověk se základním vzděláním. Neakademizuješ, nepoužíváš formální ani úřednický styl. Cílem je, aby text zněl, jako by ho napsal empatický člověk pro jiného člověka.
    `;

    const userPrompt = `
Přepiš následující text tak, aby byl přehlednější, jednodušší, stylisticky přirozený a lidský.  
Používej konkrétní, srozumitelný, lidský jazyk a jednoduché vyjadřování. Zajisti, aby text zněl přirozeně a empaticky, jako by ho formuloval člověk.
Pokud je pomoc popsána v infinitivu nebo jmenném tvaru (např. Pomoc s koupelí, Pomáhat s koupelí), převeď větu do 3. osoby (Např. Klient potřebuje pomoc s koupelí).
Nepřidávej žádné nové informace ani vysvětlení.  
Nepoužívej cizí slova, odborné výrazy ani formální styl.  
Zachovej všechny původní informace.  
Uprav text tak, aby nebyl delší než původní.  
V závěru, v novém odstavci (odděleném prázdným řádkem), krátce okomentuj provedené změny, proč je to takto lepší. Zdůrazni: je to jen návrh a je na tobě, co z navržených změn použiješ.

Text:
"""${text}"""

Výsledek:
    `;

    const stream = await openai.beta.chat.completions.stream({
      model: "gpt-4o",
      stream: true,
      temperature: 0.5,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ]
    });

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Transfer-Encoding": "chunked"
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) res.write(content);
    }

    res.end();
  } catch (err) {
    console.error("Chyba při volání OpenAI:", err);
    res.status(500).send("Chyba serveru při volání OpenAI");
  }
}
