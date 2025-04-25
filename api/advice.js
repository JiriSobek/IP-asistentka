import { Configuration, OpenAIApi } from "openai"

const conf = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
const client = new OpenAIApi(conf)

export default async function handler(req, res) {
  const { text } = req.body
  const prompt = `
Jsi odborník na sociální péči. Posuď následující text individuálního plánu:
"${text}"
Navrhni doporučení, jak text zlepšit (jasnost, empatie, konkrétnost). Odpověď ve formátu HTML, používej <b>tučný text</b> a odrážky <ul><li>.
  `
  const chat = await client.createChatCompletion({
    model: "gpt-4-0613",
    messages: [{ role:"user", content: prompt }],
  })
  res.status(200).json({ text: chat.data.choices[0].message.content })
}
