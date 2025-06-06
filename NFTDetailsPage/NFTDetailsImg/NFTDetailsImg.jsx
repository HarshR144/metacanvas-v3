import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { BsImages } from "react-icons/bs";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import { FiTag } from "react-icons/fi"; 
import axios from "axios";
//INTERNAL IMPORT
import Style from "./NFTDetailsImg.module.css";
import images from "../../img";
import { NFTMarketplaceContext } from "../../Context/NFTMarketplaceContext";
import tracker from '../../lib/tracking';
const NFTDetailsImg = ({nftId}) => {
  const { currentAccount, tokens, currentNFT: nft } = useContext(NFTMarketplaceContext);
  
  const [description, setDescription] = useState(true);
  const [details, setDetails] = useState(true);
  const [like, setLike] = useState(false);
  const [likeCount, setLikeCount] = useState(nft.likeCount);
  const [tags, setTags] = useState(nft.tags);
  console.log(nft);
  const openDescription = () => {
    if (!description) {
      setDescription(true);
    } else {
      setDescription(false);
    }
  };

  const openDetails = () => {
    if (!details) {
      setDetails(true);
    } else {
      setDetails(false);
    }
  };

  useEffect(() => {
    const fetchLikeData = async () => {
      try {
        if (currentAccount && nft) {
          const res = await axios.get(`/api/nft/getLikeCount?nftId=${nft.tokenId}&walletAddress=${currentAccount}`);
          setLike(res.data.userLiked);
          setLikeCount(res.data.likeCount);
        }
      } catch (error) {
        console.error("Error fetching like data", error);
      }
    };

    if (currentAccount && nft) {
      fetchLikeData();
    }
  }, [nft, currentAccount]);


  const toggleLike = async () => {
    try {
      if (like) {
        await axios.delete("/api/nft/unlike", { 
          data: { 
            nftId: nft.tokenId, 
            walletAddress: currentAccount 
          } 
        });
        setLike(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await axios.post("/api/nft/like", { nftId: nft.tokenId, walletAddress: currentAccount });
        setLike(true);
        setLikeCount((prev) => prev + 1);
        if (tracker) {
          tracker.trackLike(nft.tokenId, currentAccount);
        }
        
      }
    } catch (error) {
      console.error("Error toggling like", error);
    }
  };

  return (
    <div className={Style.NFTDetailsImg}>
      <div className={Style.NFTDetailsImg_box}>
        <div className={Style.NFTDetailsImg_box_NFT}>
          <div className={Style.NFTDetailsImg_box_NFT_like}>
            <BsImages className={Style.NFTDetailsImg_box_NFT_like_icon} />
            <p onClick={toggleLike}>
              {!like ? (
                <AiOutlineHeart
                  className={Style.NFTDetailsImg_box_NFT_like_icon}
                />
              ) : (
                <AiFillHeart
                  className={Style.NFTDetailsImg_box_NFT_like_icon}
                />
              )}
              <span>{likeCount}</span>
            </p>
          </div>

          <div className={Style.NFTDetailsImg_box_NFT_img}>
            <img
              src={nft?.metadata?.image || ""}
              className={Style.NFTDetailsImg_box_NFT_img_img}
              alt="NFT image"
              objectFit="cover"
            />
          </div>
        </div>

        {/* Tags Section - Display above description */}
        {tags?.length > 0 && (
          <>
            <div className={Style.NFTDetailsImg_box_tags_header}>
              <FiTag className={Style.NFTDetailsImg_box_tags_icon} />
              <p>Tags</p>
            </div>
            <div className={Style.NFTDetailsImg_box_tags}>
              {tags.map((tag, index) => (
                <span key={index} className={Style.NFTDetailsImg_box_tag}>
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}

        <div
          className={Style.NFTDetailsImg_box_description}
          onClick={() => openDescription()}
        >
          <p>Description</p>
          {description ? <TiArrowSortedUp /> : <TiArrowSortedDown />}
        </div>

        {description && (
          <div className={Style.NFTDetailsImg_box_description_box}>
            <p>{nft?.metadata?.description}</p>
          </div>
        )}

        <div
          className={Style.NFTDetailsImg_box_details}
          onClick={() => openDetails()}
        >
          <p>Details</p>
          {details ? <TiArrowSortedUp /> : <TiArrowSortedDown />}
        </div>

        {details && (
          <div className={Style.NFTDetailsImg_box_details_box}>
            {/* <small>2000 x 2000 px.IMAGE(685KB)</small> */}
            <p>
              <small>Contract Address</small>
              <br></br>
              {nft?.seller}
            </p>
            <p>
              <small>Token ID</small>
              &nbsp; &nbsp; {nft.tokenId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTDetailsImg;
