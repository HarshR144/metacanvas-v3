
import { connectDb } from '../../../lib/mongodb';
import LikedNFT from "../../../lib/models/like";
import User from '../../../lib/models/user';

export default async function handler(req, res) {
  await connectDb();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nftId, walletAddress } = req.body;

    if (!nftId || !walletAddress) {
      return res.status(400).json({ error: 'NFT ID and Wallet Address are required' });
    }

    // Find the user
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already liked
    const existingLike = await LikedNFT.findOne({ nftId, userId: user._id });
    if (existingLike) {
      return res.status(400).json({ error: 'NFT already liked' });
    }

    // Create like entry
    const newLike = new LikedNFT({ nftId, userId: user._id });
    await newLike.save();

    // Update user's likedNFTs
    user.likedNFTs.push(newLike._id);
    await user.save();

    return res.status(201).json({ message: 'NFT liked successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
