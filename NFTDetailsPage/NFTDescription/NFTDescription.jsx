import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  MdVerified,
  MdCloudUpload,
  MdTimer,
  MdReportProblem,
  MdOutlineDeleteSweep,
} from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { FaWallet, FaPercentage } from "react-icons/fa";
import {
  TiSocialFacebook,
  TiSocialLinkedin,
  TiSocialTwitter,
  TiSocialYoutube,
  TiSocialInstagram,
} from "react-icons/ti";
import { BiTransferAlt, BiDollar } from "react-icons/bi";

//INTERNAL IMPORT
import Style from "./NFTDescription.module.css";
import images from "../../img";
import { Button } from "../../components/componentsindex.js";
import { NFTTabs } from "../NFTDetailsIndex";

//IMPORT SMART CONTRACT
import { NFTMarketplaceContext } from "../../Context/NFTMarketplaceContext";
import Countdowntimer from "./CountdownTimer.jsx";

const NFTDescription = () => {
  const [social, setSocial] = useState(false);
  const [NFTMenu, setNFTMenu] = useState(false);
  const [history, setHistory] = useState(true);
  const [provanance, setProvanance] = useState(false);
  const [owner, setOwner] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const router = useRouter();

  // const historyArray = [images.user1,images.user2,images.user3,images.user4,images.user5,];
  // const provananceArray = [images.user6,images.user7,images.user8,images.user9,images.user10,];
  // const ownerArray = [images.user1,images.user8,images.user2,images.user6,images.user5,];
  // const openSocial = () => {
  //   if (!social) {
  //     setSocial(true);
  //     setNFTMenu(false);
  //   } else {
  //     setSocial(false);
  //   }
  // };
  // const openNFTMenu = () => {
  //   if (!NFTMenu) {
  //     setNFTMenu(true);
  //     setSocial(false);
  //   } else {
  //     setNFTMenu(false);
  //   }
  // };

  // const openTabs = (e) => {
  //   const btnText = e.target.innerText;
  //   if (btnText == "Bid History") {
  //     setHistory(true);
  //     setProvanance(false);
  //     setOwner(false);
  //   } else if (btnText == "Provanance") {
  //     setHistory(false);
  //     setProvanance(true);
  //     setOwner(false);
  //   }
  // };
  // const openOwmer = () => {
  //   if (!owner) {
  //     setOwner(true);
  //     setHistory(false);
  //     setProvanance(false);
  //   } else {
  //     setOwner(false);
  //     setHistory(true);
  //   }
  // };

  //SMART CONTRACT DATA
  const { buyNFT,placeBid, currentAccount,currentNFT: nft } = useContext(NFTMarketplaceContext);
  
  const handlePlaceBid = async () => {
    try {
      const transactionHash = await placeBid(nft.listingId, bidAmount);
      console.log("Bid placed successfully: ", transactionHash);
      // Refresh the NFT data after successful bid
    } catch (error) {
      console.error("Error placing bid: ", error.message);
    }
  };

const handleBuyout = async () => {
  try {
    const transactionHash = await placeBid(nft.listingId, nft.buyoutPrice);
    console.log("Buyout successful: ", transactionHash);
  } catch (error) {
    console.error("Error in buyout: ", error.message);
  }
};
  const handleBuyNFT = async () => {
    try {
      const transactionHash = await buyNFT(nft.listingId, nft.price);
      console.log("Transaction successful: ", transactionHash);
      router.push("/author");
    } catch (error) {
      console.error("Error purchasing NFT: ", error.message);
    }
  };  

  const renderActionButtons = () => {
    if (nft?.isActive && currentAccount === nft?.seller?.toLowerCase()) {
      return <p>You can't interact with your own listing</p>;
    } 
    
    else if (!nft?.isActive) {
      return (
        <Button
          icon={<FaWallet />}
          btnName="List on Marketplace"
          handleClick={() =>
            router.push(
              `/reSellToken?tokenId=${nft.tokenId}&listingId=${nft.listingId}&tokenURI=${nft.tokenURI}&price=${nft.price}`
            )
          }
          classStyle={Style.button}
        />
      );
    } 
    
    else if (nft.listingType === 1 && nft.isActive) {
      return (
        <>
          <input 
            type="number"
            placeholder="Bid amount in ETH"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className={Style.bidInput}
          />
          <Button
            icon={<FaPercentage />}
            btnName="Make Offer"
            handleClick={handlePlaceBid}
            classStyle={Style.button}
          />
          {nft.buyoutPrice && nft.buyoutPrice !=0 && (
            <Button
              icon={<FaWallet />}
              btnName={`Buy Now for ${nft.buyoutPrice} ETH`}
              handleClick={() => handleBuyout(nft.buyoutPrice)}
              classStyle={Style.button}
            />
          )}
        </>
      );
    } 
    
    else {
      return (
        <>
          <Button
            icon={<FaWallet />}
            btnName="Buy NFT"
            handleClick={handleBuyNFT}
            classStyle={Style.button}
          />
          
        </>
      );
    }
  };
  




  
  return (
    <div className={Style.NFTDescription}>
      <div className={Style.NFTDescription_box}>
        {/* //Part ONE */}
        {/* <div className={Style.NFTDescription_box_share}>
          <p>Virtual Worlds</p>
          <div className={Style.NFTDescription_box_share_box}>
            <MdCloudUpload
              className={Style.NFTDescription_box_share_box_icon}
              onClick={() => openSocial()}
            />

            {social && (
              <div className={Style.NFTDescription_box_share_box_social}>
                <a href="#">
                  <TiSocialFacebook /> Facebooke
                </a>
                <a href="#">
                  <TiSocialInstagram /> Instragram
                </a>
                <a href="#">
                  <TiSocialLinkedin /> LinkedIn
                </a>
                <a href="#">
                  <TiSocialTwitter /> Twitter
                </a>
                <a href="#">
                  <TiSocialYoutube /> YouTube
                </a>
              </div>
            )}

            <BsThreeDots
              className={Style.NFTDescription_box_share_box_icon}
              onClick={() => openNFTMenu()}
            />

            {NFTMenu && (
              <div className={Style.NFTDescription_box_share_box_social}>
                <a href="#">
                  <BiDollar /> Change price
                </a>
                <a href="#">
                  <BiTransferAlt /> Transfer
                </a>
                <a href="#">
                  <MdReportProblem /> Report abouse
                </a>
                <a href="#">
                  <MdOutlineDeleteSweep /> Delete item
                </a>
              </div>
            )}
          </div> */}
        {/* </div> */}
        {/* //Part TWO */}
        <div className={Style.NFTDescription_box_profile}>
          <h1>
            {nft?.metadata?.name} #{nft?.tokenId}
          </h1>
          <div className={Style.NFTDescription_box_profile_box}>
            <div className={Style.NFTDescription_box_profile_box_left}>
              <Image
                src={images.user1}
                alt="profile"
                width={40}
                height={40}
                className={Style.NFTDescription_box_profile_box_left_img}
              />
              <div className={Style.NFTDescription_box_profile_box_left_info}>
                <small>Creator</small> <br />
                {/* <Link href={{ pathname: "/author", query: `${nft.seller}` }}> */}
                <Link href={{ pathname: "/author" }}>
                  <span>
                    Karli Costa <MdVerified />
                  </span>
                </Link>
              </div>
            </div>

            <div className={Style.NFTDescription_box_profile_box_right}>
              <Image
                src={images.creatorbackground1}
                alt="profile"
                width={40}
                height={40}
                className={Style.NFTDescription_box_profile_box_left_img}
              />

              <div className={Style.NFTDescription_box_profile_box_right_info}>
                <small>Collection</small> <br />
                <span>
                  Mokeny app <MdVerified />
                </span>
              </div>
            </div>
          </div>

          <div className={Style.NFTDescription_box_profile_biding}>
            {nft.listingType === 1 && nft.endTime && ( // 1 represents auction type
              <>
                <p>
                  <MdTimer /> <span>Auction ending in:</span>
                </p>
                <Countdowntimer endTime={nft?.endTime} />
              </>
            )}

            <div className={Style.NFTDescription_box_profile_biding_box_price}>
              {nft.listingType === 1 ? (
                <>
                  <div className={Style.NFTDescription_box_profile_biding_box_price_bid}>
                    <small>Current Highest Bid</small>
                    <p>
                      {nft.highestBid || nft.startPrice} ETH
                    </p>
                  </div>
                  {
                    nft.buyoutPrice != 0 && 
                    <div className={Style.NFTDescription_box_profile_biding_box_price_bid}>
                    <small>Buyout Price</small>
                    <p>
                      {nft.buyoutPrice} ETH
                    </p>
                  </div>
                  }
                  
                </>
              ) : (
                <div className={Style.NFTDescription_box_profile_biding_box_price_bid}>
                  <small>Price</small>
                  <p>
                    {nft.price} ETH
                  </p>
                </div>
              )}
            </div>

            

            <div className={Style.NFTDescription_box_profile_biding_box_button}>
            {renderActionButtons()}
            </div>
{/* ------------------------------------------------------------------------------------------ */}

            {/* <div className={Style.NFTDescription_box_profile_biding_box_tabs}>
              <button onClick={(e) => openTabs(e)}>Bid History</button>
              <button onClick={(e) => openTabs(e)}>Provanance</button>
              <button onClick={() => openOwmer()}>Owner</button>
            </div> */}
            {/* {history && (
              <div className={Style.NFTDescription_box_profile_biding_box_card}>
                <NFTTabs dataTab={historyArray} />
              </div>
            )} */}
            {/* {provanance && (
              <div className={Style.NFTDescription_box_profile_biding_box_card}>
                <NFTTabs dataTab={provananceArray} />
              </div>
            )} */}

            {/* {owner && (
              <div className={Style.NFTDescription_box_profile_biding_box_card}>
                <NFTTabs dataTab={ownerArray} icon={<MdVerified />} />
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDescription;
