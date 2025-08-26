export const aiClient = {
  /**
   * Send a prompt to the configured AI endpoint. This project uses a GROQ-backed
   * AI service; the request body follows a minimal convention:
   * { model: 'groq', prompt }
   *
   * If no endpoint is configured (common in tests/local dev), return a safe
   * mocked response so callers continue to work.
   */
  async getCodingAssistance(prompt: string) {
    const endpoint = process.env.AI_ENDPOINT || process.env.NEXT_PUBLIC_AI_ENDPOINT;
    const apiKey = process.env.AI_API_KEY || process.env.NEXT_PUBLIC_AI_API_KEY;

    if (!endpoint) {
      // Fallback for tests / local development when no AI endpoint is set.
      return { suggestion: `// Mocked suggestion for: ${prompt}` };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ model: 'groq', prompt }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI request failed: ${res.status} ${text}`);
    }

    const data = await res.json();
    // Expect the GROQ AI endpoint to return an object containing the suggested
    // code under a 'suggestion' key (or similar). Return as-is so callers can
    // read the shape they expect.
    return data;
  },
};

export async function aiRegexHandler(regex: string, testString: string) {
  try {
    const re = new RegExp(regex, 'g');
    const matches: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(testString)) !== null) {
      matches.push(m[0]);
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    return { matches };
  } catch (err) {
    throw new Error('Invalid regex');
  }
}

export default aiClient;
