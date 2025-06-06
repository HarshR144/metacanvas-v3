import { connectDb } from '../../../lib/mongodb';
import LikedNFT from "../../../lib/models/like";
import User from '../../../lib/models/user';

export default async function handler(req, res) {
  await connectDb();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let { nftIds, walletAddress } = req.query;

    if (!nftIds) {
      return res.status(400).json({ error: 'NFT IDs are required' });
    }

    // Ensure nftIds is an array
    if (typeof nftIds === "string") {
      nftIds = nftIds.split(","); // Convert comma-separated string to array
    }

    // Get like counts for multiple NFTs at once
    const likeCounts = await LikedNFT.aggregate([
      { $match: { nftId: { $in: nftIds } } },
      { $group: { _id: "$nftId", count: { $sum: 1 } } }
    ]);

    const likeMap = likeCounts.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    let userLikedMap = {};
    if (walletAddress) {
      const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

      if (user) {
        const likedNFTs = await LikedNFT.find({ nftId: { $in: nftIds }, userId: user._id });
        userLikedMap = likedNFTs.reduce((acc, nft) => {
          acc[nft.nftId] = true;
          return acc;
        }, {});
      }
    }


    return res.status(200).json({ likeCounts: likeMap, userLikedMap });
  } catch (error) {
    console.error("Error in API:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
