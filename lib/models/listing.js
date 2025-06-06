import mongoose from 'mongoose';



const ListingSchema = new mongoose.Schema({
  listingId: {
      type: Number,
      required: true,
      unique: true
  },
  nft: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NFT',
      required: true
  },
  seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  listingType: {
      type: String,
      enum: ['DirectSale', 'Auction'],
      required: true
  },
  price: {
      type: Number  // In wei
  },
  startPrice: {
      type: Number  // In wei
  },
  buyoutPrice: {
      type: Number  // In wei
  },
  highestBid: {
      type: Number,  // In wei
      default: 0
  },
  highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },
  startTime: {
      type: Date
  },
  endTime: {
      type: Date
  },
  status: {
      type: String,
      enum: ['Active', 'Sold', 'Cancelled', 'Expired'],
      default: 'Active'
  },
  bids: [{
      bidder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
      },
      amount: {
          type: Number,  // In wei
          required: true
      },
      timestamp: {
          type: Date,
          default: Date.now
      }
  }]
}, { 
  timestamps: true 
});
  
  ListingSchema.index({ status: 1, listingType: 1 });
  ListingSchema.index({ seller: 1, status: 1 });
  ListingSchema.index({ nft: 1, status: 1 });
  ListingSchema.index({ endTime: 1 }, { expireAfterSeconds: 0 }); // For auction expiration

  const Listing = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
  module.exports = Listing;
