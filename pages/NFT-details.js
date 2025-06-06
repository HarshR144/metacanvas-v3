
import React, { useEffect, useContext } from "react";
import { useRouter } from "next/router";
import tracker from '../lib/tracking';
import NFTDetailsPage from "../NFTDetailsPage/NFTDetailsPage";
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const NFTDetails = () => {
  const { currentAccount, currentNFT } = useContext(NFTMarketplaceContext);
  const router = useRouter();

  useEffect(() => {
    if (currentNFT && currentAccount && tracker) {
      console.log("Starting view tracking for NFT:", currentNFT.tokenId);
      
      // Start tracking the view
      tracker.startView(currentNFT.tokenId, currentAccount);

      const handleViewEnd = () => {
        console.log("Ending view tracking for NFT:", currentNFT.tokenId);
        tracker.endView(currentNFT.tokenId, currentAccount);
      };

      // Set up cleanup handlers
      const handleRouteChange = () => {
        handleViewEnd();
      };

      const handleBeforeUnload = () => {
        handleViewEnd();
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          handleViewEnd();
        } else if (currentNFT && currentAccount) {
          // Restart tracking when tab becomes visible again
          tracker.startView(currentNFT.tokenId, currentAccount);
        }
      };

      // Add event listeners
      router.events.on('routeChangeStart', handleRouteChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        // Cleanup
        router.events.off('routeChangeStart', handleRouteChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        handleViewEnd();
      };
    }
  }, [currentNFT, currentAccount, router.events]);

  return (
    <div>
      <NFTDetailsPage nft={currentNFT} />
    </div>
  );
};

export default NFTDetails;
