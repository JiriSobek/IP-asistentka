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
V odpovědi nejprve oceň dosavadní práci pracovnice na individuálním plánu.
Při posouzení zvaž tyto klíčové body: 
1. Je popsáno, co klient zvládá sám při ranní a večerní hygieně (např. umýt si ruce, obličej, vyčistit zuby)? Je konkrétně a srozumitelně popsaná potřebná pomoc ze strany pracovnic?
2. Je konkrétně popsáno, co zvládne klient při celkové hygieně (koupání, sprchování) a s čím potřebuje pomoc (např. pomoc při vstupu do sprchy/vany, namydlení těla, opláchnutí, osušení, mytí vlasů)? 
3. Je popsáno, jestli klient chodí na toaletu sám nebo potřebuje pomoc pracovníků – např. pomoc s posazením na mísu, očištění po vykonání potřeby?
4. Je popsáno, jestli zvládne klient sám stříhání nehtů? Pokud nezvládne, je popsáno, jakou potřebuje pomoc? 
5. Má klient nějaká zvláštní přání nebo zvyklosti ohledně hygieny? Používá klient nějaké pomůcky (madlo, protiskluzová podložka)? 
6. Hrozí při hygieně nějaké riziko? Pokud ano, musí být popsáno, jak mu předcházet.

Pokud něco důležitého chybí nebo je příliš obecné, napiš 5–7 otázek, které pomohou text doplnit.
Neptej se na věci, které text už výslovně uvádí (např. pokud klientka nezvládá hygienu, neptej se co zvládá).
Pokud je text v pořádku nebo pokud klient hygienu zvládá sám, žádné otázky nepokládej. 
Odpověď napiš jako HTML. Používej <b>tučný text</b> a odrážky <ul><li>.
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
