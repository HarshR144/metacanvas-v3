import React, { useState, useContext, useEffect } from "react";
import { BsImage } from "react-icons/bs";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { MdVerified, MdTimer } from "react-icons/md";
import Link from "next/link";
import Style from "./NFTCardTwo.module.css";
import { LikeProfile } from "../../components/componentsindex";
import { NFTMarketplaceContext } from "../../Context/NFTMarketplaceContext";

const NFTCardTwo = ({ NFTData }) => {
  const { setNFT } = useContext(NFTMarketplaceContext);
  const [like, setLike] = useState(false);
  const [remainingTimes, setRemainingTimes] = useState({});

  const likeNFT = () => {
    setLike(!like);
  };

  // Function to calculate remaining time
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

  useEffect(() => {
    const initialTimes = {};
    NFTData.forEach((nft) => {
      if (nft.listingType === 1 && nft.endTime) {
        initialTimes[nft.tokenId] = calculateRemainingTime(nft.endTime);
      }
    });
    setRemainingTimes(initialTimes);

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
    <div className={Style.NFTCardTwo}>
      {NFTData?.map((el, i) => (
        <Link
          href={{ pathname: "/NFT-details", query: { tokenId: el.tokenId } }}
          key={i}
        >
          <div onClick={() => setNFT(el)} className={Style.NFTCardTwo_box}>
            <div className={Style.NFTCardTwo_box_like}>
              <div className={Style.NFTCardTwo_box_like_box}>
                <div className={Style.NFTCardTwo_box_like_box_box}>
                  <BsImage className={Style.NFTCardTwo_box_like_box_box_icon} />
                  <p onClick={likeNFT}>
                    {!el.userHasLiked ? <AiOutlineHeart /> : <AiFillHeart />}
                    {el.likesCount}
                  </p>
                </div>
              </div>
            </div>

            <div className={Style.NFTCardTwo_box_img}>
            {el.metadata && el.metadata.image ? (
              <img
                src={el.metadata.image}
                alt="NFT"
                className={Style.NFTCardTwo_box_img_img}
                objectFit="cover"
              />
            ) : (
              <div className={Style.NFTCardTwo_box_img_placeholder}>
                <BsImage size={50} />
              </div>
            )}
            </div>

            <div className={Style.NFTCardTwo_box_info}>
              <div className={Style.NFTCardTwo_box_info_left}>
                <LikeProfile />
                <p>{el.metadata.name}</p>
              </div>
            </div>

            <div className={Style.NFTCardTwo_box_price}>
              <div className={Style.NFTCardTwo_box_price_box}>
                <small>{el.listingType === 1 ? "Current Bid" : "Price"}</small>
                <p>{el.price} ETH</p>
              </div>

              {el.listingType === 1 && el.endTime && (
                <p className={Style.NFTCardTwo_box_price_stock}>
                  <MdTimer />{" "}
                  <span>{remainingTimes[el.tokenId] || "Loading..."}</span>
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default NFTCardTwo;
