import React, { useEffect, useState, useContext } from "react";

//INTRNAL IMPORT
import Style from "../styles/searchPage.module.css";
import { Slider, Brand, Loader } from "../components/componentsindex";
import { SearchBar } from "../SearchPage/searchBarIndex";
import { Filter } from "../components/componentsindex";

import { NFTCardTwo, Banner } from "../collectionPage/collectionIndex";
import images from "../img";

//SMART CONTRACT IMPORT
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";
import { useRouter } from "next/router";

const searchPage = () => {
  const { fetchAllListings, setError, currentAccount } = useContext(
    NFTMarketplaceContext
  );
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const {search} = router.query;
    if(search && nftsCopy.length > 0) {
      onHandleSearch(search);
    }
  },[router.query,nftsCopy]);


  useEffect(() => {
    try {
      if (currentAccount) {
        fetchAllListings().then((items) => {
          setNfts(items?.reverse());
          setNftsCopy(items);
          // console.log(items);
        });
      }
    } catch (error) {
      setError("Please reload the browser", error);
    }
  }, [currentAccount]);

  const onHandleSearch = (value) => {
    const filteredNFTS = nfts.filter(({ metadata }) =>
      metadata?.name.toLowerCase().includes(value.toLowerCase())
    );

    if (filteredNFTS.length === 0) {
      setNfts(nftsCopy);
    } else {
      setNfts(filteredNFTS);
    }
  };

  const onClearSearch = () => {
    if (nfts.length && nftsCopy.length) {
      setNfts(nftsCopy);
    }
  };

  // const collectionArray = [
  //   images.nft_image_1,
  //   images.nft_image_2,
  //   images.nft_image_3,
  //   images.nft_image_1,
  //   images.nft_image_2,
  //   images.nft_image_3,
  //   images.nft_image_1,
  //   images.nft_image_2,
  // ];
  return (
    <div className={Style.searchPage}>
      <Banner bannerImage={images.creatorbackground2} />
      <SearchBar
        onHandleSearch={onHandleSearch}
        onClearSearch={onClearSearch}
      />
      {/* <Filter /> */}
      {nfts?.length == 0 ? <Loader /> : <NFTCardTwo NFTData={nfts} />}
      {/* <Slider /> */}
      {/* <Brand /> */}
    </div>
  );
};

export default searchPage;
