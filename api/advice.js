import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;

    const systemMessage = `
Jsi zkušená a empatická sociální pracovnice. Pomáháš pracovníkům v sociálních službách formulovat konkrétní a srozumitelné texty do individuálních plánů klientů. Vždy odpovídej česky, přátelsky a povzbudivě. Piš přirozeným jazykem, vyhýbej se cizím a odborným slovům.`;

    const userPrompt = `
Text k posouzení:
=====
${text}
=====

1. Oceň dosavadní práci pracovnice na individuálním plánu.
2. Pokud něco důležitého chybí nebo je příliš obecné, napiš 5–7 přátelských otázek, které pomohou text doplnit.
3. Neptej se na věci, které text už výslovně uvádí (např. pokud klientka nezvládá hygienu, neptej se co zvládá).
4. Odpověď napiš jako HTML. Používej <b>tučný text</b> a odrážky <ul><li>.
`;

    const chat = await openai.chat.completions.create({
      model: "gpt-4-0613", // nebo zkus "gpt-4-0125-preview"
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ]
    });

    const advice = chat.choices[0].message.content;
    res.status(200).json({ text: advice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru při volání OpenAI" });
  }
}
