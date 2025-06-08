import React from "react";
import Image from "next/image";

//INTERNAL IMPORT
import Style from "../styles/aboutus.module.css";
import { Brand } from "../components/componentsindex";
import images from "../img";

const aboutus = () => {
  const factsArray = [
    {
      title: "500+",
      info: "NFTs minted and traded on our AI-powered marketplace",
    },
    {
      title: "100+",
      info: "Active collectors and creators in our trading community",
    },
    {
      title: "₹2.5L+",
      info: "Total trading volume across all NFT auctions and sales",
    },
  ];

  return (
    <div className={Style.aboutus}>
      <div className={Style.aboutus_box}>
        <div className={Style.aboutus_box_hero}>
          <div className={Style.aboutus_box_hero_left}>
            <h1>🚀 About MetaCanvas</h1>
            <p>
              Welcome to the future of NFT trading and creation. MetaCanvas is
              an innovative NFT marketplace that combines AI-powered creation
              tools with personalized trading experiences. Our platform
              revolutionizes how you discover, create, buy, sell, and auction
              NFTs through intelligent recommendations and cutting-edge
              technology that understands your unique preferences and trading
              style.
            </p>
          </div>
          <div className={Style.aboutus_box_hero_right}>
            <Image src={images.hero2} alt="MetaCanvas creative workspace" />
          </div>
        </div>

        <div className={Style.aboutus_box_title}>
          <h2>🎯 Our Mission</h2>
          <p>
            To create the most intelligent and personalized NFT marketplace
            where AI meets creativity. We're democratizing digital asset
            creation and trading by making it accessible, profitable, and
            perfectly tailored to each user's interests and investment goals.
          </p>
        </div>

        <div className={Style.aboutus_box_title}>
          <h2>📈 Marketplace Stats</h2>
          <p>
            See how our AI-powered platform is transforming the NFT trading
            landscape
          </p>
        </div>

        <div className={Style.aboutus_box_facts}>
          <div className={Style.aboutus_box_facts_box}>
            {factsArray.map((el, i) => (
              <div key={i} className={Style.aboutus_box_facts_box_info}>
                <h3>{el.title}</h3>
                <p>{el.info}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={Style.aboutus_box_title}>
          <h2>⚡ Platform Features</h2>
          <p>
            <strong>AI-Powered Creation:</strong> Generate unique NFTs using
            advanced AI algorithms.
            <br />
            <strong>Smart Recommendations:</strong> Discover NFTs tailored to
            your taste and trading history.
            <br />
            <strong>Dynamic Auctions:</strong> Participate in exciting live NFT
            auctions.
            <br />
            <strong>Personalized Trading:</strong> Experience a marketplace that
            adapts to your style.
          </p>
        </div>
      </div>
      <Brand />
    </div>
  );
};

export default aboutus;
