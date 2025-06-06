import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true,
    index: true 
  },
  walletAddress: { 
    type: String, 
    required: true, 
    lowercase: true,
    index: true 
  },
  
  recommendations: [{
    nftId: { 
      type: String, 
      required: true 
    },
    score: { 
      type: Number, 
      required: true 
    },
    reason: { 
      type: String, // e.g., "Similar to liked NFTs", "Popular in your price range"
      required: true 
    },
    confidence: { 
      type: Number, 
      min: 0, 
      max: 1 
    }
  }],
  
  // User preference profile learned from interactions
  userProfile: {
    preferredCategories: [String],
    preferredPriceRange: String,
    preferredAttributes: [{
      trait_type: String,
      value: String,
      weight: Number
    }],
    avgInteractionScore: Number
  },
  
  lastCalculated: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  
  // Batch processing info
  batchId: String,
  processingTime: Number, // in milliseconds
  
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
    index: { expireAfterSeconds: 0 }
  }
}, { 
  timestamps: true 
});

const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', recommendationSchema);
export default Recommendation;