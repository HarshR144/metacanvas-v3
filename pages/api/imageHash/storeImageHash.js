
import { connectDb } from '../../../lib/mongodb';
import ImageHash from '../../../lib/models/imageHash';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        await connectDb();

        const { imageHash, perceptualHash, nftId, ipfsHash } = req.body;

        if (!imageHash || !perceptualHash || !nftId || !ipfsHash) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Store the image hash in the database
        const newImageHash = new ImageHash({
            imageHash,
            perceptualHash,
            nftId,
            ipfsHash
        });

        await newImageHash.save();

        return res.status(201).json({ message: 'Image hash stored successfully' });
    } catch (error) {
        console.error('Error storing image hash:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
