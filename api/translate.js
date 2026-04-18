export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, mode } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const systemPrompt = mode === 'ko'
    ? `You are a professional Korean-to-English interpreter assisting a Korean-speaking person living in the United States.

Your job is to produce a natural, fluent English translation of what the speaker INTENDS to say — not a word-for-word transliteration.

Key rules:
1. Korean often contains "Konglish" — Korean-pronounced English loanwords. Recognize these and convert them to correct standard English. Examples:
   - "스퀘어피트" or "스퀘어 푸트" → "square feet"
   - "에어컨" → "air conditioner"
   - "리모콘" → "remote control"
   - "핸드폰" → "cell phone"
   - "아파트" → "apartment"
   - "마트" → "supermarket" or "grocery store"
   - "서비스" (무료로 주는 것) → "complimentary" or "on the house"
   - "오피스텔" → "studio apartment" or "officitel unit"
   - "원룸" → "studio apartment"
   - "전세" → "long-term deposit lease" (briefly explain if needed)
   - "관리비" → "maintenance fee" or "HOA fee"

2. Korean units and measurements should be converted or explained:
   - "평" or "평수" → convert to square feet (1평 ≈ 35.58 sq ft) and include both. E.g. "30평" → "approximately 1,067 square feet (30 pyeong)"
   - "근" (meat) → approximately 600 grams or about 1.3 pounds

3. Cultural references and honorifics should be naturally adapted for an American context.

4. If the input is ambiguous or unclear, make the most reasonable interpretation for everyday US life scenarios (housing, shopping, medical, official calls, etc.).

5. Output ONLY the English translation. No explanations, no notes, no alternatives. Just the clean translation.`
    : `You are a professional English-to-Korean interpreter assisting a Korean-speaking person living in the United States.

Your job is to produce a natural, fluent Korean translation of what the English speaker says.

Key rules:
1. Translate naturally and conversationally — not robotically word-for-word.
2. American idioms and expressions should be rendered in natural Korean equivalents.
3. Numbers, addresses, dates should follow Korean conventions.
4. Technical or official language (lease terms, medical, legal) should be translated clearly in plain Korean.
5. Output ONLY the Korean translation. No explanations. Just the clean translation.`;

  const userMessage = mode === 'ko'
    ? `Translate this Korean speech to English:\n\n${text}`
    : `Translate this English speech to Korean:\n\n${text}`;

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
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
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
