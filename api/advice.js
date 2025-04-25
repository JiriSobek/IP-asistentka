import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;

    const systemMessage = `
Jsi zkušená a nápomocná sociální pracovnice a odbornice na individuální plánování. 
Pomáháš pracovnicím v sociálních službách formulovat texty do individuálních plánů klientů.
Piš česky, přirozeně, srozumitelně a přátelsky – jako zkušená kolegyně, která chce poradit. Vyhýbej se úřednímu stylu, cizím a odborným výrazům. Používej krátké věty a styl jazyka, který dobře pochopí i člověk se základním vzděláním.
`;

    const userPrompt = `
Text k posouzení:
=====
${text}
=====
V odpovědi nejprve oceň snahu pracovnice při vytváření individuálního plánu.
Dobrý individuální plán jasně a srozumitelně popisuje, co klient zvládá sám a s čím potřebuje pomoc. Popisuje, jak konkrétně tato pomoc probíhá. Zvaž tyto klíčové body: 
1. Je popsáno, co klient zvládá sám při ranní a večerní hygieně (např. umýt si ruce, obličej, vyčistit zuby)? Je konkrétně popsaná potřebná pomoc ze strany pracovnic?
2. Je konkrétně popsáno, co zvládne klient při celkové hygieně (koupání, sprchování) a s čím potřebuje pomoc (např. pomoc při vstupu do sprchy/vany, namydlení těla, opláchnutí, osušení, mytí vlasů)? 
3. Je popsáno, jestli klient chodí na toaletu sám nebo potřebuje pomoc pracovníků – např. pomoc s posazením na mísu, očištění po vykonání potřeby?
4. Je popsáno, jestli zvládne klient sám stříhání nehtů? Pokud nezvládne, je popsáno, jakou potřebuje pomoc? 
5. Má klient nějaká zvláštní přání nebo zvyklosti ohledně hygieny? Používá klient nějaké pomůcky (madlo, protiskluzová podložka)? 
6. Hrozí při hygieně nějaké riziko? Pokud ano, musí být popsáno, jak mu předcházet.

Pokud něco důležitého chybí nebo je příliš obecné, napiš 5 otázek, které pomohou text doplnit a upřesnit.
Pokud z textu plyne, že klient je zcela závislý na pomoci pracovnic, neptej se, co klient zvládá.
Pokud klient něco zvládá sám (například ranní hygienu), žádné doplňující otázky nepokládej.
Piš odpovědi v délce maximálně 1600 znaků.

Odpověď napiš jako HTML. Používej <b>tučný text</b> a odrážky <ul><li>.
`;

    const stream = await openai.beta.chat.completions.stream({
      model: "gpt-4-0125-preview",
      stream: true,
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
