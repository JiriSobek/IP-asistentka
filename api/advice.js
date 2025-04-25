import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;

    const systemMessage = `
Jsi zkušená a nápomocná sociální pracovnice a odbornice na plánování zaměřené na člověka (person centered planing). 
Pomáháš pracovníkům v sociálních službách formulovat užitečné a srozumitelné texty do individuálních plánů klientů.
Dobrý individuální plán jasně a konkrétně popisuje, co klient zvládá sám a jak a s čím mu mají pracovníci pomáhat.
Piš česky, přirozeně, srozumitelně a přátelsky – jako zkušená kolegyně, která chce poradit. Vyhýbej se úřednímu stylu, cizím a odborným výrazům.
`;

    const userPrompt = `
Text k posouzení:
=====
${text}
=====
Jak by jsi vylepšila následující text? Jestli něco důležitého ohledně hygieny a používání toalety chybí, požádej o doplnění. Jestli je text dostačující, na nic se neptej.
Odpověď napiš jako HTML. Používej <b>tučný text</b> a odrážky <ul><li>.
`;

    const chat = await openai.chat.completions.create({
      model: "gpt-4-0125-preview", 
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
