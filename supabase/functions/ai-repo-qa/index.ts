import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
});

serve(async (req) => {
  const { repo, question } = await req.json();

  if (!repo || !question) {
    return new Response(JSON.stringify({ error: 'Repo and question are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch repository data from Supabase
  const { data: repoData, error: repoError } = await supabase
    .from('repositories')
    .select('*')
    .eq('name', repo)
    .single();

  if (repoError || !repoData) {
    return new Response(JSON.stringify({ error: 'Repository not found.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Use OpenAI to generate an answer based on the repository data and the question
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: `Based on the following repository data: ${JSON.stringify(repoData)}, answer the question: ${question}` },
    ],
  });

  const answer = response.choices[0].message.content;

  return new Response(JSON.stringify({ answer }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});