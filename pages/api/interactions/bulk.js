// pages/api/interactions/bulk.js
import { connectDb } from '../../../lib/mongodb';
import Interaction from '../../../lib/models/interaction';
import User from '../../../lib/models/user';

export default async function handler(req, res) {
  await connectDb();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { interactions, walletAddress, sessionId } = req.body;

    if (!interactions || !Array.isArray(interactions) || !walletAddress) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress });
    if (!user) {
      user = new User({ walletAddress });
      await user.save();
    }

    // Prepare bulk operations
    const bulkInteractions = interactions.map(interaction => ({
      userId: user._id,
      walletAddress,
      sessionId,
      timestamp: new Date(),
      ...interaction
    }));

    // Insert interactions
    await Interaction.insertMany(bulkInteractions);

    return res.status(201).json({ 
      message: `${bulkInteractions.length} interactions tracked successfully` 
    });

  } catch (error) {
    console.error('Error tracking bulk interactions:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
