import React, { useContext, useState, useEffect } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsImages } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
import tracker from '../../lib/tracking';
//INTERNAL IMPORT
import Style from "./NFTCard.module.css";
import images from "../../img";
import { NFTMarketplaceContext } from "../../Context/NFTMarketplaceContext";

const NFTCard = ({ NFTData }) => {
  const { setNFT,currentAccount } = useContext(NFTMarketplaceContext);
  const [like, setLike] = useState(true);
  const [remainingTimes, setRemainingTimes] = useState({});


  
  const likeNft = () => {
    if (!like) {
      setLike(true);
    } else {
      setLike(false);
    }
  };

  const handleCardClick = (nft) => {
    setNFT(nft); // Set the selected NFT in the context
    // Track view when card is clicked
  };

  // Function to calculate remaining time for auction NFTs
  const calculateRemainingTime = (endTime) => {
    if (!endTime) return null;

    const now = new Date();
    const end = new Date(endTime);
    const timeDiff = end - now;

    if (timeDiff <= 0) return "Auction ended";

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return `${hours}h : ${minutes}m : ${seconds}s`;
  };

  // Update remaining time every second
  useEffect(() => {
    // Initialize remaining times for auction NFTs
    const initialTimes = {};
    NFTData.forEach((nft) => {
      if (nft.listingType === 1 && nft.endTime) {
        initialTimes[nft.tokenId] = calculateRemainingTime(nft.endTime);
      }
    });
    setRemainingTimes(initialTimes);

    // Set up interval to update times
    const interval = setInterval(() => {
      setRemainingTimes((prevTimes) => {
        const newTimes = { ...prevTimes };
        NFTData.forEach((nft) => {
          if (nft.listingType === 1 && nft.endTime) {
            newTimes[nft.tokenId] = calculateRemainingTime(nft.endTime);
          }
        });
        return newTimes;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [NFTData]);

  return (
    <div className={Style.NFTCard}>
      {NFTData.map((el, i) => (
        <Link
          href={{ pathname: "/NFT-details", query: { tokenId: el.tokenId } }}
          key={i}
        >
          <div
            onClick={() => handleCardClick(el)}
            className={Style.NFTCard_box}
          >
            <div className={Style.NFTCard_box_img}>
              <img
                src={el.metadata.image}
                alt="NFT images"
                className={Style.NFTCard_box_img_img}
              />
            </div>

            <div className={Style.NFTCard_box_update}>
              <div className={Style.NFTCard_box_update_left}>
                <div
                  className={Style.NFTCard_box_update_left_like}
                  onClick={() => likeNft()}
                >
                  {!el.userHasLiked ? (
                    <AiOutlineHeart />
                  ) : (
                    <AiFillHeart
                      className={Style.NFTCard_box_update_left_like_icon}
                    />
                  )}
                  {el.likesCount}
                </div>
              </div>

              <div className={Style.NFTCard_box_update_right}>
                {/* Only show remaining time for auction NFTs (listingType === 1) */}
                {el.listingType === 1 && el.endTime && (
                  <div className={Style.NFTCard_box_update_right_info}>
                    <small>Remaining time</small>
                    <p>{remainingTimes[el.tokenId] || "Loading..."}</p>
                  </div>
                )}
              </div>
            </div>

            <div className={Style.NFTCard_box_update_details}>
              <div className={Style.NFTCard_box_update_details_price}>
                <div className={Style.NFTCard_box_update_details_price_box}>
                  <h4>
                    {el.metadata.name} #{el.tokenId}
                  </h4>

                  <div
                    className={Style.NFTCard_box_update_details_price_box_box}
                  >
                    <div
                      className={Style.NFTCard_box_update_details_price_box_bid}
                    >
                      <small>
                        {el.listingType === 1 ? "Current Bid" : "Price"}
                      </small>
                      <p>{el.listingType === 1 ?el.startPrice
: el.price} ETH</p>
                    </div>
                    <div
                      className={
                        Style.NFTCard_box_update_details_price_box_stock
                      }
                    >
                      {/* <small>61 in stock</small> */}
                    </div>
                  </div>
                </div>
              </div>
              <div className={Style.NFTCard_box_update_details_category}>
                <BsImages />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default NFTCard;
