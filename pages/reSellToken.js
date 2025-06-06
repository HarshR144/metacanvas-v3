import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";

//INTERNAL IMPORT
import Style from "../styles/reSellToken.module.css";
import formStyle from "../AccountPage/Form/Form.module.css";
import { Button } from "../components/componentsindex";

//IMPORT SMART CONTRACT
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const ReSellToken = () => {
  const { resellNFT } = useContext(NFTMarketplaceContext);
  const [price, setPrice] = useState(0);
  const [isAuction, setIsAuction] = useState(false);
  const [startPrice, setStartPrice] = useState(0);
  const [buyoutPrice, setBuyoutPrice] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nftData, setNftData] = useState(null);
  
  const router = useRouter();
  const { tokenId,listingId, tokenURI } = router.query;

  const fetchNFT = async () => {
    if (!tokenURI) return;
    try {
      const { data } = await axios.get(tokenURI);
      setNftData(data);
    } catch (error) {
      console.error("Error fetching NFT data:", error);
    }
  };

  useEffect(() => {
    if (tokenURI) {
      fetchNFT();
    }
  }, [tokenURI]);

  const handleResell = async () => {
    try {
      setLoading(true);
      
      if (isAuction) {
        if (!startPrice || !buyoutPrice || !duration) {
          alert("Please fill all auction fields");
          return;
        }
        if (parseFloat(buyoutPrice) <= parseFloat(startPrice)) {
          alert("Buyout price must be higher than start price");
          return;
        }
      }
      console.log("isAuction:",isAuction)
      await resellNFT(
        tokenId,
        listingId,
        price,
        isAuction,
        startPrice,
        buyoutPrice,
        duration
      );
      
      router.push("/author");
    } catch (error) {
      console.error("Error while reselling:", error);
      alert(error.message || "Error while reselling NFT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Style.reSellToken}>
      <div className={Style.reSellToken_box}>
        <h1>Resell Your NFT</h1>
        
        <div className={formStyle.Form_box_input}>
          <label>Sale Type</label>
          <select 
            className={formStyle.Form_box_input_userName}
            onChange={(e) => setIsAuction(e.target.value === "auction")}
          >
            <option value="direct">Direct Sale</option>
            <option value="auction">Auction</option>
          </select>
        </div>

        {isAuction ? (
          <>
            <div className={formStyle.Form_box_input}>
              <label>Starting Price (ETH)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Starting price"
                className={formStyle.Form_box_input_userName}
                onChange={(e) => setStartPrice(e.target.value)}
              />
            </div>
            
            <div className={formStyle.Form_box_input}>
              <label>Buyout Price (ETH)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Buyout price"
                className={formStyle.Form_box_input_userName}
                onChange={(e) => setBuyoutPrice(e.target.value)}
              />
            </div>
            
            <div className={formStyle.Form_box_input}>
              <label>Duration (Days)</label>
              <input
                type="number"
                min="1"
                placeholder="Auction duration in days"
                className={formStyle.Form_box_input_userName}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div className={formStyle.Form_box_input}>
            <label>Price (ETH)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="NFT price"
              className={formStyle.Form_box_input_userName}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        )}

        {nftData && nftData.image && (
          <div className={Style.reSellToken_box_image}>
            <Image 
              src={nftData.image} 
              alt="NFT" 
              width={400} 
              height={400}
              objectFit="contain"
            />
            <p className={Style.reSellToken_box_image_name}>{nftData.name}</p>
          </div>
        )}

        <div className={Style.reSellToken_box_btn}>
          <Button 
            btnName={loading ? "Processing..." : "Resell NFT"} 
            handleClick={handleResell}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default ReSellToken;