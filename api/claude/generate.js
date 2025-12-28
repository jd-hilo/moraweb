// Vercel serverless function for Claude API proxy
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel serverless functions need env vars WITHOUT VITE_ prefix
  let apiKey = process.env.CLAUDE_API_KEY || process.env.VITE_CLAUDE_API_KEY;

  if (!apiKey) {
    console.error('Claude API key not configured');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('CLAUDE')));
    return res.status(500).json({ error: 'Claude API key not configured' });
  }

  // Clean the API key - remove any newlines, extra whitespace, or trailing content
  apiKey = apiKey.trim().split('\n')[0].split('\r')[0].trim();
  
  // Validate it looks like a valid API key (starts with sk-ant-)
  if (!apiKey.startsWith('sk-ant-')) {
    console.error('Invalid API key format:', apiKey.substring(0, 20) + '...');
    return res.status(500).json({ error: 'Invalid Claude API key format' });
  }

  try {
    const { userData, systemPrompt, userPrompt } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}


