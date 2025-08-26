import { NextApiRequest, NextApiResponse } from 'next';
import { aiRegexHandler } from '../../../lib/aiClient';

export async function regexHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { regex, testString } = req.body;

  if (!regex || !testString) {
    return res.status(400).json({ message: 'Regex and test string are required' });
  }

  try {
    const result = await aiRegexHandler(regex, testString);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
}

export default regexHandler;