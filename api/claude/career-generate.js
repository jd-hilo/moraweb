// Vercel serverless function for Career Simulation Claude API proxy
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let apiKey = process.env.CLAUDE_API_KEY || process.env.VITE_CLAUDE_API_KEY;

  if (!apiKey) {
    console.error('Claude API key not configured');
    return res.status(500).json({ error: 'Claude API key not configured' });
  }

  apiKey = apiKey.trim().split('\n')[0].split('\r')[0].trim();

  if (!apiKey.startsWith('sk-ant-')) {
    console.error('Invalid API key format');
    return res.status(500).json({ error: 'Invalid Claude API key format' });
  }

  try {
    const { systemPrompt, userPrompt } = req.body;

    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8192,
            temperature: 0.7,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: userPrompt,
              },
            ],
          }),
        });

        if (response.status === 529 && attempt < 2) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Claude API error:', response.status, errorText);
          return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        return res.status(200).json(data);
      } catch (error) {
        lastError = error;
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
          continue;
        }
      }
    }

    console.error('All retry attempts failed:', lastError);
    return res.status(500).json({ error: lastError?.message || 'Failed to generate simulation' });
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
