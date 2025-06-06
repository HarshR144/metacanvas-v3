import React, { useContext, useState, useEffect } from "react";
import Image from "next/image";
import {
  MdVerified,
  MdCloudUpload,
  MdOutlineReportProblem,
} from "react-icons/md";
import { FiCopy } from "react-icons/fi";
import {
  TiSocialFacebook,
  TiSocialLinkedin,
  TiSocialYoutube,
  TiSocialInstagram,
} from "react-icons/ti";
import { CgWebsite } from "react-icons/cg";
import { BsThreeDots } from "react-icons/bs";

//INTERNAL IMPORT
import Style from "./AuthorProfileCard.module.css";
import images from "../../img";
import { Button } from "../../components/componentsindex.js";
import { NFTMarketplaceContext } from "../../Context/NFTMarketplaceContext.js";

const AuthorProfileCard = ({ currentAccount, userDetails }) => {
  const [share, setShare] = useState(false);
  const [report, setReport] = useState(false);

  //copyAddress function
  const copyAddress = () => {
    const copyText = document.getElementById("myInput");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
  };

  const openShare = () => {
    setShare(!share);
    setReport(false);
  };

  const openReport = () => {
    setReport(!report);
    setShare(false);
  };

  // If no profileImage, fall back to a default image
  const { profileImage } = useContext(NFTMarketplaceContext);

  return (
    <div className={Style.AuthorProfileCard}>
      <div className={Style.AuthorProfileCard_box}>
        <div className={Style.AuthorProfileCard_box_img}>
          <Image
            src={profileImage || images.defaultProfile} // Ensure a fallback image if profileImage is unavailable
            className={Style.AuthorProfileCard_box_img_img}
            alt="NFT IMAGES"
            width={220}
            height={220}
          />
        </div>

        <div className={Style.AuthorProfileCard_box_info}>
          <h2>
            {userDetails?.userName || "Loading..."}{" "}
            <span>
              <MdVerified />
            </span>
          </h2>

          <div className={Style.AuthorProfileCard_box_info_address}>
            <input type="text" value={currentAccount} id="myInput" readOnly />
            <FiCopy
              onClick={copyAddress}
              className={Style.AuthorProfileCard_box_info_address_icon}
            />
          </div>

          <p>{userDetails?.description || "No description available."}</p>
          <p>{userDetails?.email || "No email available."}</p>

          <div className={Style.AuthorProfileCard_box_info_social}>
            {userDetails?.socialLinks?.website && (
              <a href={userDetails.socialLinks.website}>
                <CgWebsite />
              </a>
            )}
            {userDetails?.socialLinks?.facebook && (
              <a href={userDetails.socialLinks.facebook}>
                <TiSocialFacebook />
              </a>
            )}
            {userDetails?.socialLinks?.instagram && (
              <a href={userDetails.socialLinks.instagram}>
                <TiSocialInstagram />
              </a>
            )}
            {userDetails?.socialLinks?.linkedin && (
              <a href={userDetails.socialLinks.linkedin}>
                <TiSocialLinkedin />
              </a>
            )}
            {userDetails?.socialLinks?.youtube && (
              <a href={userDetails.socialLinks.youtube}>
                <TiSocialYoutube />
              </a>
            )}
          </div>
        </div>

        <div className={Style.AuthorProfileCard_box_share}>
          {/* <Button btnName="Follow" handleClick={() => {}} /> */}
          <MdCloudUpload
            onClick={openShare}
            className={Style.AuthorProfileCard_box_share_icon}
          />

          {share && (
            <div className={Style.AuthorProfileCard_box_share_upload}>
              <p>
                <span>
                  <TiSocialFacebook />
                </span>{" "}
                Facebook
              </p>
              <p>
                <span>
                  <TiSocialInstagram />
                </span>{" "}
                Instagram
              </p>
              <p>
                <span>
                  <TiSocialLinkedin />
                </span>{" "}
                LinkedIn
              </p>
              <p>
                <span>
                  <TiSocialYoutube />
                </span>{" "}
                YouTube
              </p>
            </div>
          )}

          <BsThreeDots
            onClick={openReport}
            className={Style.AuthorProfileCard_box_share_icon}
          />

          {report && (
            <p className={Style.AuthorProfileCard_box_share_report}>
              <span>
                <MdOutlineReportProblem />
              </span>{" "}
              Report abuse
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorProfileCard;
