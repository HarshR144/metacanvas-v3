import axios from 'axios';

class InteractionTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.pendingInteractions = [];
    this.batchTimeout = 2000;
    this.activeViews = new Map(); // Track active views
    this.processedViews = new Set(); // Prevent duplicate processing
    this.batchTimer = null;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async trackInteraction(nftId, walletAddress, interactionType, metadata = {}) {
    try {
      await axios.post('/api/interactions/track', {
        nftId,
        walletAddress,
        interactionType,
        metadata,
        sessionId: this.sessionId
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
      this.pendingInteractions.push({
        nftId,
        walletAddress,
        interactionType,
        metadata,
        timestamp: new Date()
      });
      this.scheduleBatchSend();
    }
  }

  // Start tracking a view
  startView(nftId, walletAddress) {
    const viewKey = `${nftId}_${walletAddress}`;
    
    // Clear any existing view for this NFT/user combo
    this.endView(nftId, walletAddress);
    
    const startTime = Date.now();
    this.activeViews.set(viewKey, {
      startTime,
      nftId,
      walletAddress,
      processed: false
    });
    
    console.log(`Started tracking view for NFT ${nftId} at ${startTime}`);
  }

  // End tracking a view and record the duration
  endView(nftId, walletAddress) {
    const viewKey = `${nftId}_${walletAddress}`;
    const viewData = this.activeViews.get(viewKey);
    
    if (viewData && !viewData.processed) {
      const duration = Math.floor((Date.now() - viewData.startTime) / 1000);
      
      // Only track if duration is meaningful (at least 1 second)
      if (duration >= 1) {
        console.log(`Ending view for NFT ${nftId}, duration: ${duration}s`);
        
        // Mark as processed to prevent double-tracking
        viewData.processed = true;
        
        this.trackInteraction(nftId, walletAddress, 'view', {
          viewDuration: duration,
          viewEndTime: Date.now(),
          page: 'nft-details'
        });
      }
      
      this.activeViews.delete(viewKey);
    }
  }


  
  // Track NFT creation start (for measuring creation duration)

  // Track NFT creation completion
  async trackNFTCreation(nftId, walletAddress, nftData) {

    const metadata = {
      name: nftData.name,
      description: nftData.description,
      category: 'general',
      tags: nftData.tags || [],
      price: nftData.price?.toString(),
      isAuction: nftData.isAuction || false,
      attributes: [],
      imageUrl: nftData.imageUrl,
      transactionHash: nftData.transactionHash,
    };

    console.log(`Tracking NFT creation for ${nftId}`, metadata);
    
    return this.trackInteraction(nftId, walletAddress, 'create', metadata);
  }

  // Track purchases
  async trackPurchase(nftId, walletAddress, purchasePrice, transactionHash) {
    return this.trackInteraction(nftId, walletAddress, 'purchase', {
      purchasePrice,
      transactionHash
    });
  }

  // Track bids
  async trackBid(nftId, walletAddress, bidAmount) {
    return this.trackInteraction(nftId, walletAddress, 'bid', {
      bidAmount
    });
  }

  // Track likes
  async trackLike(nftId, walletAddress) {
    return this.trackInteraction(nftId, walletAddress, 'like');
  }

  // Batch send pending interactions
  scheduleBatchSend() {
    if (this.batchTimeout) return;

    this.batchTimeout = setTimeout(async () => {
      if (this.pendingInteractions.length > 0) {
        try {
          await axios.post('/api/interactions/bulk', {
            interactions: this.pendingInteractions,
            walletAddress: this.pendingInteractions[0]?.walletAddress,
            sessionId: this.sessionId
          });
          this.pendingInteractions = [];
        } catch (error) {
          console.error('Error sending batch interactions:', error);
        }
      }
      this.batchTimeout = null;
    }, 5000);
  }

  // Clean up all active views (useful for app shutdown)
  cleanup() {
    for (const [viewKey, viewData] of this.activeViews.entries()) {
      if (!viewData.processed) {
        this.endView(viewData.nftId, viewData.walletAddress);
      }
    }
  }
}

// Create global instance
const tracker = typeof window !== 'undefined' ? new InteractionTracker() : null;

export default tracker;