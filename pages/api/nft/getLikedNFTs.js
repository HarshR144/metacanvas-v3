import { connectDb } from '../../../lib/mongodb';
import LikedNFT from "../../../lib/models/like";
import User from '../../../lib/models/user';

// to keep in mind that when displaying the nfts filter out the active ones and
//  then show them else dont
export default async function handler(req, res) {
  await connectDb();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet Address is required' });
    }

    // Find user
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's liked NFTs
    const likedNFTs = await LikedNFT.find({ userId: user._id }).select('nftId');
    
    return res.status(200).json({ likedNFTs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
