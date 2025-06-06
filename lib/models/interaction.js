import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  nftId: { 
    type: String, 
    required: true,
    index: true 
  },
  walletAddress: { 
    type: String, 
    required: true, 
    lowercase: true,
    index: true 
  },
  interactionType: { 
    type: String, 
    enum: ['view', 'like', 'purchase', 'bid', 'create'], 
    required: true,
    index: true 
  },
  
  // Additional context for different interaction types
  metadata: {
    // For purchases
    purchasePrice: String,
    transactionHash: String,
    
    // For bids
    bidAmount: String,
    
    // For views
    viewDuration: Number, // in seconds
    
    // For shares
    platform: String,
   // For creates
    name: String, // NFT name
    description: String, // NFT description
    category: String, // NFT category for recommendations
    tags: [String], // Array of tags for better categorization
    price: String, // Initial listing price
    isAuction: Boolean, // Whether it's an auction
    attributes: [{
      trait_type: String,
      value: String
    }], // NFT attributes for similarity matching
    imageUrl: String, // For thumbnail in recommendations
  },
  
  sessionId: String, // To track user sessions
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  }
}, { 
  timestamps: true 
});

// Compound indexes for efficient queries
interactionSchema.index({ userId: 1, interactionType: 1, timestamp: -1 });
interactionSchema.index({ nftId: 1, interactionType: 1 });
interactionSchema.index({ walletAddress: 1, timestamp: -1 });
interactionSchema.index({ 'metadata.category': 1, interactionType: 1 }); // For category-based recommendations
interactionSchema.index({ 'metadata.tags': 1, interactionType: 1 }); // For tag-based recommendations


const Interaction = mongoose.models.Interaction || mongoose.model('Interaction', interactionSchema);
export default Interaction;
