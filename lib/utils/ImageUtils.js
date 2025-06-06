// utils/imageUtils.js
import crypto from 'crypto';
import sharp from 'sharp';
import axios from 'axios';
import ImageHash from '../models/imageHash';

// Calculate crypto hash of an image (for exact matches)
export const calculateImageHash = async (imageBuffer) => {
  return crypto.createHash('sha256').update(imageBuffer).digest('hex');
};

// Calculate perceptual hash for similar image detection
export const calculatePerceptualHash = async (imageBuffer) => {
  try {
    // Resize image to 32x32 grayscale for perceptual hashing
    const resizedImage = await sharp(imageBuffer)
      .resize(32, 32, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer();
    
    // Calculate hash based on DCT (Discrete Cosine Transform)
    // This is a simplified perceptual hash implementation
    const pixels = new Uint8Array(resizedImage);
    const avg = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;
    
    // Create binary hash string based on whether pixel is above/below average
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

// Calculate Hamming distance between two binary strings
const hammingDistance = (str1, str2) => {
  if (str1.length !== str2.length) return Infinity;
  
  let distance = 0;
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) distance++;
  }
  
  return distance;
};

// Check if an image is similar to any existing ones
const checkImageSimilarity = async (perceptualHash) => {
  try {
    const allHashes = await ImageHash.find();
    
    for (const storedHash of allHashes) {
      const distance = hammingDistance(perceptualHash, storedHash.perceptualHash);
      
      // Threshold can be adjusted - lower means more strict matching
      if (distance < 100) {
        return {
          isSimilar: true,
          similarity: (1024 - distance) / 1024, // Normalize to 0-1 range
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

// Check if an image already exists or is similar to existing ones
export const verifyImageUniqueness = async (imageBuffer) => {
  try {
    // Calculate both hash types
    const imageHash = await calculateImageHash(imageBuffer);
    const perceptualHash = await calculatePerceptualHash(imageBuffer);
    
    // Check for exact matches
    const exactMatch = await ImageHash.findOne({ imageHash });
    if (exactMatch) {
      return {
        isUnique: false,
        duplicateType: 'exact',
        duplicateOf: exactMatch.nftId,
        ipfsHash: exactMatch.ipfsHash
      };
    }
    
    // Check for similar images
    const similarityCheck = await checkImageSimilarity(perceptualHash);
    if (similarityCheck.isSimilar) {
      return {
        isUnique: false,
        duplicateType: 'similar',
        similarity: similarityCheck.similarity,
        duplicateOf: similarityCheck.similarTo,
        ipfsHash: similarityCheck.ipfsHash
      };
    }
    
    // If we reach here, the image is unique
    return { 
      isUnique: true,
      imageHash,
      perceptualHash
    };
  } catch (error) {
    console.error('Error verifying image uniqueness:', error);
    throw error;
  }
};

// Store image hash after verification passes
export const storeImageHash = async (imageHash, perceptualHash, nftId, ipfsHash) => {
  try {
    const newImageHash = new ImageHash({
      imageHash,
      perceptualHash,
      nftId,
      ipfsHash
    });
    
    await newImageHash.save();
    return true;
  } catch (error) {
    console.error('Error storing image hash:', error);
    throw error;
  }
};

// Update NFT ID in the image hash record after successful minting
export const updateNftIdForHash = async (ipfsHash, nftId) => {
  try {
    // Find the record by IPFS hash and update the NFT ID
    const result = await ImageHash.findOneAndUpdate(
      { ipfsHash },
      { nftId },
      { new: true }
    );
    
    if (!result) {
      console.warn(`No hash record found for IPFS hash: ${ipfsHash}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating NFT ID for hash record:', error);
    throw error;
  }
};
