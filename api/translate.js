export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, mode } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const prompt = mode === 'ko'
    ? `Translate the following Korean text to natural, fluent English. Return ONLY the translation, no explanation, no punctuation changes unless necessary:\n\n${text}`
    : `다음 영어 문장을 자연스럽고 정확한 한국어로 번역해 주세요. 번역문만 출력하고 설명은 하지 마세요:\n\n${text}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const translated = data.content?.[0]?.text?.trim() || '';
    return res.status(200).json({ translated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
