import type { NextApiRequest, NextApiResponse } from 'next';
import { aiClient } from '../../../lib/aiClient';

export async function codingAssistantHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    const response = await aiClient.getCodingAssistance(prompt);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
}

export default codingAssistantHandler;