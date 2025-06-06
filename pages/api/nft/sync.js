// pages/api/nft/sync.js
import { connectDb } from '../../../lib/mongodb';
import NFT from '../../../lib/models/nft';

export default async function handler(req, res) {
  await connectDb();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nfts } = req.body;

    if (!nfts || !Array.isArray(nfts)) {
      return res.status(400).json({ error: 'NFTs array is required' });
    }

    const bulkOps = nfts.map(nft => {
      // Extract attributes and create tags for content-based filtering
      const tags = [...nft.tags];
      const attributes = nft.metadata?.attributes || [];
      
      // Add attribute values as tags
      attributes.forEach(attr => {
        if (attr.value) {
          tags.push(attr.value.toLowerCase());
        }
      });

      // Add category-based tags
      if (nft.metadata?.name) {
        const nameWords = nft.metadata.name.toLowerCase().split(' ');
        tags.push(...nameWords);
      }

      // Determine price range for content filtering
      let priceRange = 'low';
      const price = parseFloat(nft.price || 0);
      if (price > 10) priceRange = 'premium';
      else if (price > 1) priceRange = 'high';
      else if (price > 0.1) priceRange = 'medium';

      return {
        updateOne: {
          filter: { tokenId: nft.tokenId },
          update: {
            $set: {
              tokenId: nft.tokenId,
              listingId: nft.listingId,
              name: nft.metadata?.name || `NFT #${nft.tokenId}`,
              description: nft.metadata?.description || '',
              image: nft.metadata?.image || '',
              attributes: [],
              price: nft.listingType == 1 ? nft.highestBid :nft.price,
              seller: nft.seller?.toLowerCase(),
              owner: nft.owner?.toLowerCase(),
              listingType: nft.listingType || 0,
              isActive: nft.isActive,
              tags: [...new Set(tags)], // Remove duplicates
              priceRange,
              lastUpdated: new Date()
            }
          },
          upsert: true
        }
      };
    });

    const result = await NFT.bulkWrite(bulkOps);

    return res.status(200).json({ 
      message: 'NFTs synced successfully',
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount
    });

  } catch (error) {
    console.error('Error syncing NFTs:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
