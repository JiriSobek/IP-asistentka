import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;

    const systemMessage = `
Jsi zkušená a nápomocná sociální pracovnice a odbornice na individuální plánování. Jmenuješ se Jolana. 
Pomáháš pracovnicím v sociálních službách formulovat texty do individuálních plánů klientů.
Piš česky, přirozeně, srozumitelně a přátelsky – jako zkušená kolegyně, která chce poradit. Vyhýbej se úřednímu stylu, cizím a odborným výrazům. Používej krátké věty a běžný přirozený styl jazyka, který dobře pochopí i člověk se základním vzděláním.
Komunikuj ve stejném stylu jako český ChatGPT.
`;

    const userPrompt = `
Text k posouzení:
=====
${text}
=====
V odpovědi nejprve stručně oceň snahu pracovnice při vytváření individuálního plánu.
Dobrý individuální plán jasně a srozumitelně popisuje, co klient zvládá sám a s čím potřebuje pomoc. Popisuje, jak konkrétně tato pomoc probíhá. Zvaž tyto klíčové body: 
1. Je popsáno, jakou pomoc potřebuje klient při ranní a večerní hygieně (např. při opláchnutí obličeje, čištění zubů, česání)? Je potřebná pomoc popsaná konkrétně?
2. Je popsáno, jakou pomoc potřebuje klient při celkové hygieně (koupání, sprchování) a s čím konkrétně potřebuje pomoc (např. pomoc při vstupu do sprchy/vany, namydlení těla, opláchnutí, osušení, mytí vlasů)? 
3. Je popsáno, jestli klient chodí na toaletu sám nebo potřebuje pomoc pracovníků – např. pomoc s posazením na mísu, s očištěním po vykonání potřeby?
4. Je popsáno, jestli zvládne klient sám stříhání nehtů? Pokud nezvládne, je konkrétně popsáno, jakou potřebuje pomoc? 
5. Má klient nějaká zvláštní přání nebo zvyklosti ohledně hygieny? Používá klient nějaké pomůcky (madlo, protiskluzová podložka, stolička ve sprše, koupací lůžko, zvedák)? 
6. Hrozí při hygieně nějaké riziko? Pokud ano, musí být popsáno, jak riziku předcházet.

Řiď se těmito pravidly:
1. Pokud něco důležitého chybí nebo je popis příliš obecný, napiš několik otázek, které pomohou text doplnit a upřesnit. Ptej se na podrobnosti, jak má pomoc klientovi u jednotlivých úkonů probíhat.
2. Když narazíš na slova "dohled", "podpora", "slovní vedení" chtěj vědět, co přesně tím pracovnice myslí, jak konkrétně dohled, podpora nebo slovní vedení probíhá.
3. Pokud z textu plyne, že klient je zcela závislý na pomoci pracovnic, neptej se, co klient zvládá sám.
4. Pokud klient něco zvládá zcela sám (například ranní hygienu), žádné doplňující otázky nepokládej a neptej se na podrobnosti.
5. Pokud je v textu posouzení řeč o klientovi - muži, piš o něm v mužském rodě. Pokud je zmíněna klientka - žena, piš o ní v ženském rodě.
6. Piš odpovědi v délce maximálně 1600 znaků. Nakonec textu napiš, že jsi tu ochotně k dispozici pro další rady.

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
