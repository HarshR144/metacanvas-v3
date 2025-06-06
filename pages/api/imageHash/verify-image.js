// pages/api/verify-image.js

import { connectDb } from '../../../lib/mongodb';
import crypto from 'crypto';
import sharp from 'sharp';
import ImageHash from '../../../lib/models/imageHash';

const calculateImageHash = (imageBuffer) => {
  return crypto.createHash('sha256').update(imageBuffer).digest('hex');
};

const calculatePerceptualHash = async (imageBuffer) => {
  try {
    const resizedImage = await sharp(imageBuffer)
      .resize(32, 32, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer();

    const pixels = new Uint8Array(resizedImage);
    const avg = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;
    
    let hash = '';
    for (let i = 0; i < pixels.length; i++) {
      hash += pixels[i] >= avg ? '1' : '0';
    }

    return hash;
  } catch (error) {
    console.error('Error calculating perceptual hash:', error);
    throw error;
  }
};

const hammingDistance = (str1, str2) => {
  if (str1.length !== str2.length) return Infinity;
  let distance = 0;
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) distance++;
  }
  return distance;
};

const checkImageSimilarity = async (perceptualHash) => {
  try {
    const allHashes = await ImageHash.find();
    console.log("all hashes from db:", allHashes);
    for (const storedHash of allHashes) {
      const distance = hammingDistance(perceptualHash, storedHash.perceptualHash);
      if (distance < 100) {
        return {
          isSimilar: true,
          similarity: (1024 - distance) / 1024,
          similarTo: storedHash.nftId,
          ipfsHash: storedHash.ipfsHash
        };
      }
    }
    return { isSimilar: false };
  } catch (error) {
    console.error('Error checking image similarity:', error);
    throw error;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await connectDb(); // Ensure database connection

  try {
    const { imageBuffer } = req.body;

    // Convert base64 to Buffer
    const buffer = Buffer.from(imageBuffer, 'base64');

    // Compute hashes
    const imageHash = calculateImageHash(buffer);
    const perceptualHash = await calculatePerceptualHash(buffer);

    // Check for exact duplicates
    const exactMatch = await ImageHash.findOne({ imageHash });
    if (exactMatch) {
      return res.json({
        isUnique: false,
        duplicateType: 'exact',
        duplicateOf: exactMatch.nftId,
        ipfsHash: exactMatch.ipfsHash
      });
    }

    // Check for similar images
    const similarityCheck = await checkImageSimilarity(perceptualHash);
    if (similarityCheck.isSimilar) {
      return res.json({
        isUnique: false,
        duplicateType: 'similar',
        similarity: similarityCheck.similarity,
        duplicateOf: similarityCheck.similarTo,
        ipfsHash: similarityCheck.ipfsHash
      });
    }

    // If no match found
    res.json({ isUnique: true, imageHash, perceptualHash });
  } catch (error) {
    console.error('Error verifying uniqueness:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
