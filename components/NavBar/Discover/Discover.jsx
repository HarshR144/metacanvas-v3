import React from "react";
import Link from "next/link";

//INTERNAL IMPORT
import Style from "./Discover.module.css";

const Discover = () => {
  //--------DISCOVER NAVIGATION MENU
  // const discover = [
  //   {
  //     name: "Collection",
  //     link: "collection",
  //   },
  //   {
  //     name: "Search",
  //     link: "searchPage",
  //   },
  //   // {
  //   //   name: "Author Profile",
  //   //   link: "author",
  //   // },
  //   // {
  //   //   name: "Account Setting",
  //   //   link: "account",
  //   // },
  //   // {
  //   //   name: "Upload NFT",
  //   //   link: "uploadNFT",
  //   // },
  //   // {
  //   //   name: "Connect Wallet",
  //   //   link: "connectWallet",
  //   // },
  // ];
  // return (
  //   <div>
  //     {discover.map((el, i) => (
  //       <div key={i + 1} className={Style.discover}>
  //         <Link href={{ pathname: `${el.link}` }}>{el.name}</Link>
  //       </div>
  //     ))}
  //   </div>
  // );
  return (
    <div className={Style.discover}>
      <Link href="/searchPage">
        <a className={Style.exploreText}>Explore</a>
      </Link>
    </div>
  );
};

export default Discover;
