// File: pages/api/advice.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Only POST');
    return;
  }

  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).send('Missing text');
      return;
    }

    const systemMessage = `
Jsi zkušená a nápomocná sociální pracovnice a odbornice na individuální plánování.
Pomáháš pracovnicím v sociálních službách formulovat texty do individuálních plánů klientů.
Piš česky, přirozeně, srozumitelně a přátelsky – jako zkušená kolegyně.
Generuj pouze HTML fragment (<p>, <b>, <ul>, <li>), bez <html>, <head>, <body> a bez DOCTYPE.
`;

    const userPrompt = `
Text k posouzení:
=====\n${text}\n=====
Nejprve oceň snahu pracovnice.
Dobrý plán popisuje, co klient zvládá sám a jakou pomoc potřebuje.
Zvaž body:
1. Ranní/veřerní hygiena
2. Koupání/sprchování
3. Toaleta
4. Péče o nehty
5. Zvyklosti/pomůcky
6. Potenciální rizika
Chybí-li něco, napiš 5 otázek k doplnění.
Odpověď strukturovaná jako HTML fragment, max.1600 znaků.
`;

    const stream = await openai.chat.completions.create({
      model: "gpt-4-0613",
      stream: true,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ]
    });

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Transfer-Encoding': 'chunked'
    });

    for await (const part of stream) {
      const delta = part.choices?.[0]?.delta?.content;
      if (delta) {
        res.write(delta);
      }
    }
    res.end();

  } catch (err) {
    console.error('API error', err);
    res.status(500).send('Server error');
  }
}


<!-- File: public/index.html -->
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <title>AI asistentka pro individuální plán</title>
  <style>
    body { font-family: system-ui, sans-serif; font-size:16px; line-height:1.5; padding:20px; }
    textarea { width:725px; height:200px; border:1px solid #ccc; border-radius:12px; padding:10px; resize:vertical; font:inherit; }
    button { background:#e76a58; color:white; border:none; padding:10px 20px; margin:5px; cursor:pointer; border-radius:999px; font-size:1rem; }
    #result { margin-top:20px; }
  </style>
</head>
<body>
  <textarea id="editor" placeholder="Zde napište text..."></textarea><br>
  <button id="btnAdvice">Poradit</button>
  <button id="btnImprove">Vylepšit</button>
  <button id="btnUndo" disabled>Zpět</button>
  <button id="btnCopy">Kopírovat</button>
  <div id="result"></div>

  <script>
    const editor = document.getElementById('editor');
    const result = document.getElementById('result');
    let beforeImprove = '';

    document.getElementById('btnAdvice').onclick = async () => {
      const text = editor.value.trim(); if (!text) return alert('Napiš nejdřív text.');
      result.innerHTML = '<b>Moment, přemýšlím…</b>';
      const res = await fetch('/api/advice', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text }) });
      if (!res.ok || !res.body) { result.innerHTML = '<b>Chyba při načítání odpovědi.</b>'; return; }
      result.innerHTML = '';
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      while(true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        result.insertAdjacentHTML('beforeend', chunk);
      }
    };

    document.getElementById('btnImprove').onclick = async () => {
      const text = editor.value.trim(); if (!text) return alert('Napiš nejdřív text.');
      beforeImprove = text; document.getElementById('btnUndo').disabled = false;
      result.innerHTML = '<b>Moment, přemýšlím…</b>';
      const res = await fetch('/api/improve', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text }) });
      const { text: improved } = await res.json();
      editor.value = improved; result.innerHTML = '';
    };

    document.getElementById('btnUndo').onclick = () => {
      editor.value = beforeImprove;
      result.innerHTML = '';
      document.getElementById('btnUndo').disabled = true;
    };

    document.getElementById('btnCopy').onclick = () => {
      const t = editor.value.trim(); if (!t) return;
      navigator.clipboard.writeText(t)
        .then(() => {
          const b = document.getElementById('btnCopy');
          b.textContent = 'Zkopírováno ✓';
          setTimeout(()=>b.textContent='Kopírovat',2000);
        });
    };
  </script>
</body>
</html>
