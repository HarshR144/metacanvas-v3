import React, { useContext } from "react";

//INTERNAL IMPORT
import { NFTDescription, NFTDetailsImg, NFTTabs } from "./NFTDetailsIndex";
import Style from "./NFTDetailsPage.module.css";
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const NFTDetailsPage = ({ nft }) => {
   const { currentAccount, tokens, currentNFT } = useContext(NFTMarketplaceContext);
  
  // console.log(nft)
  return (
    <div className={Style.NFTDetailsPage}>
      <div className={Style.NFTDetailsPage_box}>
        <NFTDetailsImg nft={nft.id} />
        <NFTDescription nft={currentNFT} />
      </div>
    </div>
  );
};

export default NFTDetailsPage;
