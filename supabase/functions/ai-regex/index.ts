import { serve } from 'std/server';

serve(async (req) => {
  const { regex, testString } = await req.json();

  if (!regex || !testString) {
    return new Response(JSON.stringify({ error: 'Regex and test string are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const pattern = new RegExp(regex);
    const matches = testString.match(pattern);
    const result = matches ? matches : [];

    return new Response(JSON.stringify({ matches: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid regex pattern.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});