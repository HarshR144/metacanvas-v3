import mongoose from 'mongoose';

const nftSchema = new mongoose.Schema({
  tokenId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  listingId: { 
    type: String,
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  image: { 
    type: String 
  },
  attributes: [{
    trait_type: String,
    value: String
  }],
  price: { 
    type: String 
  },
  seller: { 
    type: String, 
    lowercase: true,
    index: true 
  },
  owner: { 
    type: String, 
    lowercase: true,
    index: true 
  },
  listingType: { 
    type: Number, // 0 for direct sale, 1 for auction
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  category: { 
    type: String, 
    default: 'Art' 
  },
  tags: [String], // For content-based filtering
  
  // Metrics for recommendation
  totalViews: { 
    type: Number, 
    default: 0 
  },
  totalLikes: { 
    type: Number, 
    default: 0 
  },
  totalPurchases: { 
    type: Number, 
    default: 0 
  },
  
  // Content features for ML
  priceRange: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'premium'] 
  },
  
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// Create indexes for better query performance
nftSchema.index({ tokenId: 1, isActive: 1 });
nftSchema.index({ attributes: 1 });
nftSchema.index({ category: 1, isActive: 1 });
nftSchema.index({ tags: 1 });

const NFT = mongoose.models.NFT || mongoose.model('NFT', nftSchema);
export default NFT;
