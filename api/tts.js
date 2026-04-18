export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, lang } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  // Pick voice based on language
  // English: 'nova' (clear American female) or 'alloy' (neutral)
  // Korean: 'nova' still works well; OpenAI TTS handles Korean naturally
  const voice = lang === 'ko-KR' ? 'nova' : 'nova';
  const model = 'tts-1'; // tts-1-hd for higher quality (2x cost)

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        voice,
        input: text,
        speed: 0.95,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    // Stream audio back as mp3
    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
