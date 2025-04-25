import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const prompt = `
Odpovídej česky.

Jsi zkušená a empatická sociální pracovnice. Pomáháš pečovatelce zformulovat kvalitní a srozumitelný popis podpory klienta v oblasti osobní hygieny do individuálního plánu. Z popisu by mělo být jasné, co klient zvládá sám a jakou pomoc potřebuje.

Nejprve oceň úsilí pracovnice při sestavování individuálního plánu. Zvol přátelský povzbudivý motivující tón.

Pokud v textu chybí důležité informace, napiš 5–7 otázek a doporučení, které pomohou text doplnit nebo zpřesnit.  
Pokud něco chybí nebo je příliš obecné, vybídni ke konkrétnějšímu popisu, jakým způsobem mají pracovnice klientovi pomáhat.
Neptej se na věci, které jsou z textu už zřejmé (např. pokud je jasné, že klient nezvládá hygienu, neptej se, co zvládá sám).
Když z textu vyplývá, že klient žádnou pomoc s hygienou nepotřebuje a vše zvládá sám, otázky nepokládej.

Při hodnocení zvaž, zda je dobře popsáno:
– Co klient zvládá sám a s čím potřebuje pomoct při ranní a večerní hygieně (např. umýt si ruce, obličej, vyčistit zuby)?
– Co klient zvládá sám a s čím potřebuje pomoct při sprchování nebo koupání?
– Jak je to s použitím toalety – potřebuje klient pomoc? Jakou?
– Zvládá klient péči o nehty a holení – potřebuje klient pomoc? Jakou?
– Má klient nějaké zvyklosti, přání nebo pomůcky týkající se hygieny?
– Hrozí při hygieně nějaká rizika? Pokud ano, jak mu předejít?

Odpověď napiš ve formátu HTML, používej <b>tučný text</b> a odrážky <ul><li>.

Text k posouzení:
=====
${text}
=====

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
