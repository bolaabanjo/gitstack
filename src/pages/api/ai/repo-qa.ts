import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';
import { validateRepoQAInput } from '../../../utils/validators';

export async function repoQAHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { repo, question } = req.body;

  const validationError = validateRepoQAInput(repo, question);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    // Fetch repository data from Supabase or GitHub API
    const { data, error } = await supabase
      .from('repositories')
      .select('*')
      .eq('name', repo);

    if (error || !data.length) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    const repository = data[0];

    // Here you would integrate with your AI service to process the question
    const aiResponse = await getAIResponse(repository, question);

    return res.status(200).json({ answer: aiResponse });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default repoQAHandler;

async function getAIResponse(repository: any, question: string) {
  // Placeholder for AI integration logic
  // This should call your AI service and return the response
  return `This is a mock response for the question: "${question}" regarding the repository: "${repository.name}".`;
}