// Run inside an async IIFE so we can use dynamic import without top-level await
(async () => {
  // @ts-ignore: Deno std library import in Supabase Edge Function
  const mod: any = await import("https://deno.land/std@0.201.0/http/server.ts");
  const serve: any = mod.serve;

  serve(async (req: Request) => {
  const { prompt } = await req.json().catch(() => ({}));

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Prompt is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const AI_ENDPOINT = process.env.AI_ENDPOINT;
  const AI_API_KEY = process.env.AI_API_KEY;

  if (!AI_ENDPOINT || !AI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'AI endpoint or API key not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Forward the prompt to the configured GROQ-compatible AI endpoint.
    // The endpoint contract used here is a JSON POST with { model, prompt }.
    const aiRes = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({ model: 'groq', prompt }),
    });

    const body = await aiRes.json().catch(() => null);

    // Normalize response: prefer common fields but fall back to raw body
    let output: any = body;
    if (body) {
      if (body.choices && Array.isArray(body.choices) && body.choices[0]?.message) {
        output = body.choices[0].message;
      } else if (body.output) {
        output = body.output;
      } else if (body.result) {
        output = body.result;
      }
    }

    return new Response(JSON.stringify({ data: output }), {
      status: aiRes.status >= 200 && aiRes.status < 300 ? 200 : aiRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate response', details: String(err) }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  });

})();