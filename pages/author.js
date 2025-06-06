import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useForm } from "react-hook-form"; // <-- Make sure this is imported

//INTERNAL IMPORT
import Style from "../styles/author.module.css";
import { Banner, NFTCardTwo } from "../collectionPage/collectionIndex";
import { Brand, Title } from "../components/componentsindex";
import FollowerTabCard from "../components/FollowerTab/FollowerTabCard/FollowerTabCard";
import images from "../img";
import {
  AuthorProfileCard,
  AuthorTaps,
  AuthorNFTCardBox,
} from "../authorPage/componentIndex";

//IMPORT SMART CONTRACT DATA
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const author = () => {
  const { profileImage, currentAccount, setUserData } = useContext(
    NFTMarketplaceContext,
  );
  const [fileUrl, setFileUrl] = useState(profileImage);
  const [userDetails, setUserDetails] = useState(null);

  const { register, handleSubmit, setValue } = useForm(); // <-- Initialize useForm here

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `/api/user/userDetails?walletAddress=${currentAccount}`,
        );
        const data = response.data;
        setUserDetails(data);
        setValue("userName", data.userName);
        setValue("email", data.email);
        setValue("description", data.description);
        setValue("website", data.socialLinks?.website || "");
        setValue("facebook", data.socialLinks?.facebook || "");
        setValue("twitter", data.socialLinks?.twitter || "");
        setValue("instagram", data.socialLinks?.instagram || "");
        setValue("wallet", data.walletAddress);
        setFileUrl(data.profileImage || profileImage);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setFileUrl(profileImage);
      }
    };

    if (currentAccount.length > 0) fetchUserDetails();
  }, [currentAccount, setValue]);

  const followerArray = [
    {
      background: images.creatorbackground1,
      user: images.user1,
      seller: "7d64gf748849j47fy488444",
    },
    {
      background: images.creatorbackground1,
      user: images.user1,
      seller: "7d64gf748849j47fy488444",
    },
    {
      background: images.creatorbackground2,
      user: images.user2,
      seller: "7d64gf748849j47fy488444",
    },
    {
      background: images.creatorbackground3,
      user: images.user3,
      seller: "7d64gf748849j47fy488444",
    },
    {
      background: images.creatorbackground4,
      user: images.user4,
      seller: "7d64gf748849j47fy488444",
    },
    {
      background: images.creatorbackground5,
      user: images.user5,
      seller: "7d64gf748849j47fy488444",
    },
    {
      background: images.creatorbackground6,
      user: images.user6,
      seller: "7d64gf748849j47fy488444",
    },
  ];

  const [collectiables, setCollectiables] = useState(true);
  const [created, setCreated] = useState(false);
  const [like, setLike] = useState(false);
  const [follower, setFollower] = useState(false);
  const [following, setFollowing] = useState(false);

  //IMPORT SMART CONTRACT DATA
  const { fetchMyListedNFTs, fetchMyOwnedNFTs, fetchAllListings } = useContext(
    NFTMarketplaceContext,
  );

  const [nfts, setNfts] = useState([]);
  const [myNFTs, setMyNFTs] = useState([]);
  const [likedNFTs, setLikedNFTs] = useState([]);

  // new effects:
  useEffect(() => {
    try {
      const fetchListedItems = async () => {
        const listedItems = await fetchMyListedNFTs();
        setNfts(listedItems || []);
      };

      if (currentAccount) fetchListedItems();
    } catch (e) {
      console.log(e);
    }
  }, [currentAccount, fetchMyListedNFTs]);

  // useEffect(() => {
  //   fetchMyNFTsOrListedNFTs("fetchItemsListed").then((items) => {
  //     setNfts(items);
  //     console.log(nfts);
  //   });
  // }, []);
  useEffect(() => {
    try {
      const fetchOwnedItems = async () => {
        const ownedItems = await fetchMyOwnedNFTs();
        setMyNFTs(ownedItems || []);
      };

      if (currentAccount) fetchOwnedItems();
    } catch (e) {
      console.log(e);
    }
  }, [currentAccount, fetchMyOwnedNFTs]);

  // useEffect(() => {
  //   fetchMyNFTsOrListedNFTs("fetchMyNFTs").then((items) => {
  //     setMyNFTs(items);
  //     console.log(myNFTs);
  //   });
  // }, []);


// fetch liked Nfts by current user
  useEffect(() => {
    const fetchLikedNFTs = async () => {
      try {
        const response = await axios.get(`/api/nft/getLikedNFTs?walletAddress=${currentAccount}`);
      const likedNFTsData = response.data.likedNFTs || [];
      
      // Extract just the NFT IDs from the response
      const likedNFTIds = likedNFTsData.map(item => item.nftId);
      
      // Get all active listings from the blockchain
      const activeListings = await fetchAllListings();
      
      // Filter the active listings to only include NFTs that:
      // 1. Are liked by the current user
      // 2. Are active
      // 3. Are owned by the contract (not by individuals)
      const activeLikedNFTs = activeListings.filter(
        (nft) => 
          likedNFTIds.includes(nft.tokenId) && 
          nft.isActive === true && 
          nft.owner === process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
      );
      
      setLikedNFTs(activeLikedNFTs);
    } catch (error) {
      console.error("Error fetching liked NFTs:", error);
      setLikedNFTs([]);
    }
  };

  if (currentAccount) fetchLikedNFTs();
}, [currentAccount, fetchAllListings]);



  return (
    <div className={Style.author}>
      {/* <Banner bannerImage={images.creatorbackground2} /> */}
      <AuthorProfileCard
        currentAccount={currentAccount}
        userDetails={userDetails}
      />
      <AuthorTaps
        setCollectiables={setCollectiables}
        setCreated={setCreated}
        setLike={setLike}
        setFollower={setFollower}
        setFollowing={setFollowing}
        currentAccount={currentAccount}
      />

      <AuthorNFTCardBox
        collectiables={collectiables}
        created={created}
        like={like}
        follower={follower}
        following={following}
        nfts={nfts}
        myNFTS={myNFTs}
        likedNFTs = {likedNFTs}
      />
      <Title
        heading="Popular Creators"
        paragraph="Click on music icon and enjoy NTF music or audio"
      />
      <div className={Style.author_box}>
        {followerArray.map((el, i) => (
          <FollowerTabCard key={i} i={i} el={el} />
        ))}
      </div>

      <Brand />
    </div>
  );
};

export default author;
