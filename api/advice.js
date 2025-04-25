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
V odpovědi nejprve oceň snahu pracovnice. Zvaž přehlednost, konkrétnost a srozumitelnost. Pokud něco chybí, napiš 5–7 doplňujících otázek.
Odpověď napiš **jako čistý HTML fragment** (bez zpětných apostrofů a bez <html>/<body> wrapperu), používej <b>tučný text</b> a odrážky <ul><li>, maximálně 1600 znaků.
`;

    // SSE streamování
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user",   content: userPrompt }
      ],
      stream: true
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta?.content;
      if (delta) {
        // posíláme dílčí HTML přímo na front-end
        res.write(delta);
      }
    }
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).end("Chyba serveru při volání OpenAI");
  }
}
