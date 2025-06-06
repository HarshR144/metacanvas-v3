import mongoose from 'mongoose';

// Check if mongoose is ready to avoid "Cannot read properties of undefined" error
const likeSchema = new mongoose.Schema(
  {
    nftId: { 
      type: String, 
      required: true,
      lowercase: true 
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
// likeSchema.index({ nftId: 1, walletAddress: 1 }, { unique: true }); // Ensure unique likes per user

// Use a try-catch block to handle potential errors
let LikedNFT;
try {
  // Check if the model already exists to prevent overwriting
  LikedNFT = mongoose.models.LikedNFT || mongoose.model('LikedNFT', likeSchema);
} catch (error) {
  LikedNFT = mongoose.model('LikedNFT', likeSchema);
}

// Use ES module export syntax since you're using ES module imports
export default LikedNFT;