import { connectDb } from '../../../lib/mongodb';
import Interaction from '../../../lib/models/interaction';
import User from '../../../lib/models/user';
import NFT from '../../../lib/models/nft';

export default async function handler(req, res) {
  await connectDb();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      nftId, 
      walletAddress, 
      interactionType, 
      metadata = {},
      sessionId 
    } = req.body;

    if (!nftId || !walletAddress || !interactionType) {
      return res.status(400).json({ 
        error: 'NFT ID, wallet address, and interaction type are required' 
      });
    }

    // Validate interaction type
    const validTypes = ['view', 'like', 'purchase', 'bid', 'create'];
    if (!validTypes.includes(interactionType)) {
      return res.status(400).json({ error: 'Invalid interaction type' });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress });
    if (!user) {
      user = new User({ walletAddress });
      await user.save();
    }

    // For view interactions, implement better deduplication
    if (interactionType === 'view') {
      // Check for recent views in the same session
      const recentView = await Interaction.findOne({
        userId: user._id,
        nftId,
        interactionType: 'view',
        sessionId,
        timestamp: { $gte: new Date(Date.now() - 10000) } // Within last 5 seconds
      });
      
      if (recentView) {
        console.log('Duplicate view blocked - too recent');
        return res.status(200).json({ message: 'View already recorded recently' });
      }

      // For longer durations, check if there's a recent view without duration
      // and update it instead of creating a new one
      if (metadata.viewDuration && metadata.viewDuration > 30) {
        const recentViewWithoutDuration = await Interaction.findOne({
          userId: user._id,
          nftId,
          interactionType: 'view',
          sessionId,
          'metadata.viewDuration': { $exists: false },
          timestamp: { $gte: new Date(Date.now() - 300000) } // Within last 5 minutes
        });

        if (recentViewWithoutDuration) {
          // Update the existing record instead of creating a new one
          recentViewWithoutDuration.metadata = {
            ...recentViewWithoutDuration.metadata,
            ...metadata
          };
          recentViewWithoutDuration.timestamp = new Date();
          await recentViewWithoutDuration.save();
          
          console.log('Updated existing view record with duration');
          return res.status(200).json({ 
            message: 'View duration updated',
            interactionId: recentViewWithoutDuration._id 
          });
        }
      }
    }

     // Special handling for create interactions
    if (interactionType === 'create') {
      // Validate create-specific metadata
      if (!metadata.name || !metadata.description) {
        return res.status(400).json({ 
          error: 'Name and description are required for create interactions' 
        });
      }

      // Check if NFT creation was already tracked for this transaction
      if (metadata.transactionHash) {
        const existingCreate = await Interaction.findOne({
          walletAddress,
          interactionType: 'create',
          'metadata.transactionHash': metadata.transactionHash
        });

        if (existingCreate) {
          console.log('Duplicate create interaction blocked - same transaction hash');
          return res.status(200).json({ 
            message: 'NFT creation already tracked',
            interactionId: existingCreate._id 
          });
        }
      }
    }

    // Create interaction record
    const interaction = new Interaction({
      userId: user._id,
      nftId,
      walletAddress,
      interactionType,
      metadata,
      sessionId
    });

    await interaction.save();

    // Update NFT metrics
    const updateField = `total${interactionType.charAt(0).toUpperCase() + interactionType.slice(1)}s`;
    await NFT.findOneAndUpdate(
      { tokenId: nftId },
      { $inc: { [updateField]: 1 } },
      { upsert: false }
    );

    console.log(`Interaction tracked: ${interactionType} for NFT ${nftId}, duration: ${metadata.viewDuration || 'N/A'}`);

    return res.status(201).json({ 
      message: 'Interaction tracked successfully',
      interactionId: interaction._id 
    });

  } catch (error) {
    console.error('Error tracking interaction:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}