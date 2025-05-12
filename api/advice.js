import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;

    const systemMessage = `
Jsi zkušená a nápomocná sociální pracovnice a odbornice na individuální plánování. Jmenuješ se Julie. 
Pomáháš pracovnicím v sociálních službách formulovat texty do individuálních plánů klientů.
Piš česky jako rodilá mluvčí, přirozeně, srozumitelně a přátelsky – jako zkušená kolegyně, která chce poradit. V odpovědích používej tykání. Vyhýbej se úřednímu stylu, cizím slovům a odborným výrazům. Nepoužívej slova komplexní a specifický. Používej krátké věty a běžný přirozený styl jazyka, který dobře pochopí i člověk se základním vzděláním. Dbej na gramatickou správnost.
`;

    const userPrompt = `
Text k posouzení:
=====
${text}
=====
V odpovědi nejprve jednou větou oceň snahu pracovnice při vytváření individuálního plánu.
Dobrý individuální plán jasně a srozumitelně popisuje, co klient zvládá sám, s čím potřebuje pomoc a jak konkrétně tato pomoc probíhá. Zvaž tyto klíčové body: 
1. Je popsáno, jakou pomoc potřebuje klient při ranní a večerní hygieně (např. při opláchnutí obličeje, čištění zubů, česání)? Je potřebná pomoc popsaná konkrétně?
2. Je popsáno, jakou pomoc potřebuje klient při celkové hygieně (koupání, sprchování) a s čím konkrétně potřebuje pomoc (např. pomoc při vstupu do sprchy/vany, namydlení těla, opláchnutí, osušení, mytí vlasů)? 
3. Je popsáno, jestli klient potřebuje pomoc při užívání toalety?
4. Je popsáno, jestli zvládne klient sám stříhání nehtů? Pokud nezvládne, je konkrétně popsáno, jakou potřebuje pomoc? A jak je to se stříháním vlasů? Využívá klient služeb kadeřníka nebo vlasy stříhá personál?
5. Má klient nějaká zvláštní přání nebo zvyklosti ohledně hygieny? Používá klient nějaké pomůcky (madlo, protiskluzová podložka, stolička ve sprše, koupací lůžko, zvedák)? 
6. Hrozí při hygieně nějaké riziko? Pokud ano, musí být popsáno, jak riziku předcházet.

Řiď se těmito pravidly:
1. Pokud něco důležitého chybí nebo je popis příliš obecný, napiš maximálně 5 otázek, které pomohou text doplnit a upřesnit. Ptej se na podrobnosti, jak má pomoc klientovi u jednotlivých úkonů probíhat.
2. Když narazíš na slova "dohled", "podpora", "slovní vedení", "slovní podpora" chtěj vědět, co přesně tím pracovnice myslí, jak konkrétně dohled, podpora nebo slovní vedení probíhá.
3. Pokud z textu plyne, že klient je zcela závislý na pomoci pracovnic, neptej se, co klient zvládá sám.
4. Pokud klient zvládá hygienu sám, bez pomoci, bez podpory, žádné doplňující otázky nepokládej a neptej se na podrobnosti.
5. Pokud je v textu k posouzení řeč o klientovi - muži, piš o něm v mužském rodě. Pokud je zmíněna klientka - žena, piš o ní v ženském rodě.
6. Piš odpovědi v délce maximálně 1600 znaků. Nakonec textu napiš, že jsi tu ochotně k dispozici pro další rady.

Odpověď napiš jako HTML. Používej <b>tučný text</b> a odrážky <ul><li>.
`;

    const stream = await openai.beta.chat.completions.stream({
      model: "gpt-4",
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
