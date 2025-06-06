import React, { useEffect, useState, useContext } from 'react';
import { NFTMarketplaceContext } from '../../Context/NFTMarketplaceContext';

const GlobalAuctionMonitor = () => {
  const { fetchAllListings, endAuction, currentAccount } = useContext(NFTMarketplaceContext);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [processedAuctions, setProcessedAuctions] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all active auctions periodically
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const listings = await fetchAllListings();
        const auctions = listings.filter(
          listing => 
            listing.listingType === 1 && // Is auction
            listing.isActive && // Is still active
            listing.endTime &&// Has an end time
            !processedAuctions.has(listing.listingId)
        );
        setActiveAuctions(auctions);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      }
    };

    // Fetch immediately and then every minute
    if(currentAccount){
      fetchAuctions();
      const interval = setInterval(fetchAuctions, 60000); // Every minute
      return () => clearInterval(interval);
    }
    
  }, [fetchAllListings, currentAccount]);

  // Check for ended auctions and process them
  useEffect(() => {
    const processEndedAuctions = async () => {
      if (!currentAccount || isProcessing || activeAuctions.length === 0) return;

      setIsProcessing(true);
      try {
        const now = new Date().getTime();
        
        for (const auction of activeAuctions) {
          const endTime = new Date(auction.endTime).getTime();
          if (now >= endTime && !processedAuctions.has(auction.listingId)) {
            console.log(`Ending auction for listing ${auction.listingId}`);
            try {
                console.log(auction.listingId);
              await endAuction(auction.listingId);
              setProcessedAuctions(prev => new Set([...prev, auction.listingId]));
              console.log(`Successfully ended auction for listing ${auction.listingId}`);
            } catch (error) {
              console.error(`Failed to end auction ${auction.listingId}:`, error);
            }
          }
        }
      } finally {
        setIsProcessing(false);
      }
    };
    if(currentAccount){
      const interval = setInterval(processEndedAuctions, 60000); // Check every minute
      processEndedAuctions(); // Initial check
      return () => clearInterval(interval);
    }
    
    
  }, [currentAccount,activeAuctions, endAuction, isProcessing]);

  // Component doesn't render anything visually
  return null;
};

export default GlobalAuctionMonitor;