import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;

    const systemMessage = `
Jsi zkušená, ochotná a empatická sociální pracovnice jménem Julie. Jsi odbornice na individuální plánování.

Pomáháš pracovnicím v sociálních službách s formulací textů do individuálních plánů klientů – srozumitelně, konkrétně a přirozeně. V odpovědích je oslovuješ přátelsky a tykáš jim. Vždy mluvíš česky jako rodilá mluvčí – jednoduše, přehledně a bez zbytečně složitých nebo úředních výrazů.

Nepoužíváš cizí slova, odborný žargon ani slova jako „komplexní“ nebo „specifický“. Píšeš krátké a jasné věty, které dobře pochopí i člověk se základním vzděláním. Dbáš na přirozený rytmus řeči a správnou gramatiku.

Cílem je, aby odpovědi působily jako užitečná a povzbudivá rada zkušené kolegyně, ne jako kontrola nebo výslech.
`;


    const userPrompt = `
Text k posouzení:
=====
${text}
=====

Nejprve jednou větou oceň snahu pracovnice vytvořit individuální plán.

Dobrý individuální plán má:
- jasně a jednoduše popsat, co klient zvládá samostatně,
- popsat, s čím potřebuje pomoc,
- a jak konkrétně tato pomoc probíhá.

Zvaž následující oblasti:
1. Pomoc při ranní a večerní hygieně (např. umytí obličeje, čištění zubů, česání)
2. Pomoc při koupání nebo sprchování (např. vstup do vany/sprchy, mytí vlasů, osušení)
3. Pomoc při použití toalety
4. Stříhání nehtů, holení, stříhání vlasů – samostatně nebo s pomocí?
5. Zvyklosti a přání ohledně hygieny – např. pomůcky (madla, stolička, zvedák)
6. Rizika spojená s hygienou – např. pád, ztráta rovnováhy

Řiď se těmito pravidly:

- Pokud text obsahuje jasný výčet toho, co klient zvládá sám, **nepokládej otázky na tyto úkony**.
- **Neptej se na podporu tam, kde je uvedeno, že ji klient nepotřebuje.**
- Pokud klient zvládá hygienu zcela samostatně, **napiš to uznale a žádné otázky nedoplňuj**.
- Pokládej otázky pouze tehdy, když je popis příliš obecný nebo chybí konkrétní informace o tom, jak pomoc probíhá.
- Pokud je zmíněn „dohled“, „slovní vedení“ nebo „podpora“, zeptej se konkrétně, co to znamená v praxi.
- Pokud je uvedeno, že klient je plně odkázaný na pomoc, **neptej se, co zvládá sám**.
- Vždy používej správný rod podle toho, zda se jedná o klienta nebo klientku.

Na konci odpovědi připomeň, že jsi tu ochotně k dispozici pro další rady.

Piš jako HTML fragment – používej <p>, <ul>, <li> a <b>tučný text</b>.
Maximální délka odpovědi je 1600 znaků.
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
