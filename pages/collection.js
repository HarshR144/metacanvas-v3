import React from "react";

//INTERNAL IMPORT
import Style from "../styles/collection.module.css";
import images from "../img";
import {
  Banner,
  CollectionProfile,
  NFTCardTwo,
} from "../collectionPage/collectionIndex";
import { Slider, Brand } from "../components/componentsindex";
import Filter from "../components/Filter/Filter";

const collection = () => {
  const collectionArray = [
    {
      tokenId: "1",
      listingType: 0,  // 0 for fixed price, 1 for auction
      price: "0.1",
      metadata: {
        name: "NFT #1",
        image: "img/nft-image-1.png"
      },
      likesCount: 0,
      userHasLiked: false
    },
    {
      tokenId: "2",
      listingType: 0,
      price: "0.2",
      metadata: {
        name: "NFT #2",
        image: "img/nft-image-2.png"
      },
      likesCount: 5,
      userHasLiked: true
    },
    // Continue for the other objects...
  ];
  return (
    <div className={Style.collection}>
      <Banner bannerImage={images.creatorbackground1} />
      <CollectionProfile />
      <Filter />
      <NFTCardTwo NFTData={collectionArray} />

      <Slider />
      <Brand />
    </div>
  );
};

export default collection;
