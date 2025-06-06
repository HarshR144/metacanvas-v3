import { connectDb } from '../../../lib/mongodb';
import LikedNFT from "../../../lib/models/like";
import User from '../../../lib/models/user';


export default async function handler(req, res) {
  await connectDb();
  console.log("Count DB call")
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nftId,  walletAddress } = req.query;

    if (!nftId) {
      return res.status(400).json({ error: 'NFT ID is required' });
    }

    const likeCount = await LikedNFT.countDocuments({ nftId });
    let userLiked = false;
    if (walletAddress) {
      const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (user) {
        const liked = await LikedNFT.findOne({ nftId, userId: user._id });
        userLiked = !!liked;
      }
    }
    return res.status(200).json({ likeCount, userLiked });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
