// models/ImageHash.js
import mongoose from 'mongoose';

const ImageHashSchema = new mongoose.Schema({
  imageHash: { type: String, required: true, unique: true },
  perceptualHash: { type: String, required: true },
  nftId: { type: String, required: true },
  ipfsHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ImageHash = mongoose.models.ImageHash || mongoose.model('ImageHash', ImageHashSchema);

export default ImageHash;