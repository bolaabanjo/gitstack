import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

export default async function webhook(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { event, session } = req.body;

    // Handle the webhook event
    switch (event) {
      case 'USER_SIGNED_UP':
        // Logic for user sign-up event
        break;
      case 'USER_LOGGED_IN':
        // Logic for user login event
        break;
      case 'USER_LOGGED_OUT':
        // Logic for user logout event
        break;
      default:
        return res.status(400).json({ message: 'Event not recognized' });
    }

    return res.status(200).json({ message: 'Webhook processed' });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}