import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  walletAddress: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true 
  },
userName: { 
      type: String,
      default: 'Unnamed'
  },
  profileImage: { 
      type: String 
  },
  description: { 
      type: String 
  },
  email: { 
      type: String,
      trim: true
  },
  likedNFTs: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'likedNFT' 
  }],
  socialLinks: {
      twitter: String,
      instagram: String,
      website: String
  },
  ownedNFTs: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'NFT' 
  }],
  listedNFTs: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Listing' 
  }]
}, { 
  timestamps: true 
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;