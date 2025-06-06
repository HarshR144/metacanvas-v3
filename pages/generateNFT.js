import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";

import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";
import { Button, GenerateNFT } from "../components/componentsindex";
import Style from "../styles/generateNFT.module.css";

const GenerateNFTPage = () => {
  const { currentAccount } = useContext(NFTMarketplaceContext);
  const router = useRouter();

  // useEffect(() => {
  //   if (currentAccount === "") {
  //     router.push("/");
  //   }
  // }, [currentAccount]);

  return (
    <div className={Style.generateNFT}>
      <div className={Style.generateNFT_box}>
        <div className={Style.generateNFT_box_heading}>
          <h1>Generate NFT Image</h1>
          <p>Create unique NFT images using AI and mint them on the blockchain</p>
        </div>

        <div className={Style.generateNFT_box_form}>
          <GenerateNFT />
        </div>
      </div>
    </div>
  );
};

export default GenerateNFTPage;