import { connectDb } from '../../../lib/mongodb';
import LikedNFT from "../../../lib/models/like";
import User from '../../../lib/models/user';

export default async function handler(req, res) {
  await connectDb();

  if (req.method !== 'DELETE') {
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

    // Find and delete the like entry
    const like = await LikedNFT.findOneAndDelete({ nftId, userId: user._id });
    if (!like) {
      return res.status(404).json({ error: 'Like not found' });
    }

    // Remove from user's likedNFTs
    user.likedNFTs = user.likedNFTs.filter(id => id.toString() !== like._id.toString());
    await user.save();

    return res.status(200).json({ message: 'NFT unliked successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
