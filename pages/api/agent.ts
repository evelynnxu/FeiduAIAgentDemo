import type { NextApiRequest, NextApiResponse } from 'next';
import { callAgent, Message } from '../../lib/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { messages } = req.body;
  if (!Array.isArray(messages)) {
    res.status(400).json({ error: 'Invalid messages' });
    return;
  }
  try {
    const reply = await callAgent(messages as Message[]);
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
} 