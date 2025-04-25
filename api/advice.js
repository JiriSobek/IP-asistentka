import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;
    const prompt = `
Jsi zkušená, empatická sociální pracovnice. Pomáháš pečovatelce sestavit individuální plán pro jejího klienta v oblasti osobní hygieny. Pomoc musí být popsána srozumitelně a konkrétně. Je vhodné používat běžný přirozený jazyk s minimem cizích slov a odborných termínů. Musí být popsáno, co klient zvládne sám a jakou pomoc a podporu potřebuje. Posuď tento text:
"${text}"
Navrhni doporučení, jak text zlepšit. V úvodu vyzdvihni snahu pracovnice sestavit dobrý individuální plán. Pokud je text mlhavý nebo chybí důležité informace, napiš 5 – 7 otázek, které pomohou text doplnit nebo upřesnit. Otázky a komentáře piš přátelským a povzbudivým tónem. Personál označuj slovy pracovník nebo pracovnice. 
Při analýze zvaž tyto klíčové body: 
Je popsáno, co klient zvládá sám při ranní a večerní hygieně (např. umýt si ruce, obličej, vyčistit zuby)? Je konkrétně a srozumitelně popsaná potřebná pomoc ze strany pracovnic?
Je konkrétně popsáno, co zvládne klient při celkové hygieně (koupání, sprchování) a s čím potřebuje pomoc (např. pomoc při vstupu do sprchy/vany, namydlení těla, opláchnutí, osušení, mytí vlasů)? Je popsáno, kde celková hygiena probíhá – např. ve vaně, ve sprše, na sprchovacím lůžku? 
Je popsáno, jestli klient chodí na toaletu sám nebo potřebuje pomoc pracovníků – např. pomoc s posazením na mísu, očištění po vykonání potřeby?
Je popsáno, jestli zvládne klient sám stříhání nehtů a popřípadě holení? Pokud nezvládne, je popsáno, jakou potřebuje pomoc? 
Má klient nějaká zvláštní přání nebo zvyklosti ohledně hygieny? Používá klient nějaké pomůcky (madlo, protiskluzová podložka)? 
Hrozí při hygieně nějaké riziko? Pokud ano, musí být popsáno, jak mu předcházet.
Pokud je text v pořádku nebo pokud klient vše v této oblasti zvládá sám, žádné otázky nepokládej.
Odpověď ve formátu HTML, používej <b>tučný text</b> a odrážky <ul><li>.
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
