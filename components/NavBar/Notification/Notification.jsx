import React, { useContext } from "react";
import Image from "next/image";

//INTERNAL IMPORT
import Style from "./Notification.module.css";
import images from "../../../img";
import { NFTMarketplaceContext } from "../../../Context/NFTMarketplaceContext";

const Notification = ({ currentAccount }) => {
  const { profileImage, userName } = useContext(NFTMarketplaceContext);

  return (
    <div className={Style.notification}>
      <p>Notification</p>
      <div className={Style.notification_box}>
        {currentAccount ? (
          <>
            <div className={Style.notification_box_img}>
              <Image
                src={profileImage}
                alt="profile image"
                width={50}
                height={50}
                className={Style.notification_box_img}
              />
            </div>
            <div className={Style.notification_box_info}>
              <h4>{userName}</h4>
              <p>Connected to Wallet</p>
              <small>Successfully Wallet Integrated</small>
            </div>
          </>
        ) : (
          <div className={Style.notification_box_info}>
            <p>Wallet Not Connected</p>
            <small>Please Connect to the Wallet</small>
          </div>
        )}
        <span className={Style.notification_box_new}></span>
      </div>
    </div>
  );
};

export default Notification;
