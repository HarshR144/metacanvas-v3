import React, { useState, useEffect, useContext } from "react";

//INTERNAL IMPORT
import Style from "../styles/index.module.css";
import {
  HeroSection,
  Service,
  BigNFTSilder,
  Subscribe,
  Title,
  Category,
  Filter,
  NFTCard,
  Collection,
  AudioLive,
  FollowerTab,
  Slider,
  Brand,
  Video,
  Loader,
} from "../components/componentsindex";
import { getTopCreators } from "../TopCreators/TopCreators";

//IMPORTING CONTRCT DATA
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";
import NFTRecommendations from "../components/NFTRecommendations/NFTRecommendations";

const Home = () => {
  const { currentAccount, fetchAllListings } = useContext(
    NFTMarketplaceContext
  );

  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);
  const [creators, setCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (currentAccount) {
        try {
          setIsLoading(true);
          const items = await fetchAllListings();
          if (items) {
            setNfts(items.reverse());
            setNftsCopy(items);
            // Calculate creators after NFTs are loaded
            const topCreators = getTopCreators(items);
            setCreators(topCreators);
          }
        } catch (error) {
          console.log("Error fetching NFTs:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [currentAccount]);

  return (
    <div className={Style.homePage}>
      {/* <HeroSection /> */}
      {/* <Service /> */}
      {/* <BigNFTSilder /> */}
      {/* <Title
        heading="Audio Collection"
        paragraph="Discover the most outstanding NFTs in all topics of life."
      />
      <AudioLive /> */}
      {/* {isLoading ? (
        <Loader />
      ) : creators.length === 0 ? (
        <div className={Style.noCreators}>No creators found</div>
      ) : (
        <FollowerTab TopCreator={creators} />
      )} */}

      {/*Vidoe nft slider  */}
      {/* <Slider /> */}
      {/* <Collection /> */}
      <Title
        heading="Featured NFTs"
        paragraph="Discover the most outstanding NFTs in all topics of life."
      />
      {/* <Filter /> */}
      {isLoading ? (
        <Loader />
      ) : nfts.length === 0 ? (
        <div className={Style.noNFTs}>No NFTs found</div>
      ) : (
        <>
          <NFTCard NFTData={nfts} />
          <NFTRecommendations nfts= {nfts}/>
        </>
        
      )}


      <Title
        heading="Browse by category"
        paragraph="Explore the NFTs in the most featured categories."
      />
      <Category />
      {/* <Subscribe /> */}
      {/* <Brand /> */}
      {/* <Video /> */}
    </div>
  );
};

export default Home;
