
import { connectDb } from '../../../lib/mongodb';
import ImageHash from '../../../lib/models/imageHash';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { ipfsHash, tokenId } = req.body;

    if (!ipfsHash || !tokenId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await connectDb();
    console.log("MytokenId in api ",tokenId)
    const result = await ImageHash.findOneAndUpdate(
      { ipfsHash },
      { nftId: tokenId },
      { new: true }
    );
    

    const deleteResult = await ImageHash.deleteMany({ nftId: /^temp_/ });

    console.log(`Deleted ${deleteResult.deletedCount} temporary image hash records.`);

    if (!result) {
      console.warn(`No hash record found for IPFS hash: ${ipfsHash}`);
      return false;
    }
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating token ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
