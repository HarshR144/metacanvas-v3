import React, { useState, useEffect, useContext, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import axios from "axios";

// INTERNAL IMPORT
import Style from "../styles/account.module.css";

import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";
import { IoMail, IoWalletOutline } from "react-icons/io5";
import { RiTwitterXLine } from "react-icons/ri";
import {
  TiSocialFacebook,
  TiSocialInstagram,
  TiSocialTwitter,
} from "react-icons/ti";
import { CgWebsite } from "react-icons/cg";

const Account = () => {
  const { uploadToPinata, profileImage, currentAccount, setUserData } =
    useContext(NFTMarketplaceContext);
  const [fileUrl, setFileUrl] = useState(profileImage);
  const [userDetails, setUserDetails] = useState(null);

  const { register, handleSubmit, setValue } = useForm();

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

  const [file, setFile] = useState(null);

  const onDrop = async (acceptedFile) => {
    try {
      const url = await uploadToPinata(acceptedFile[0]);
      setFileUrl(url);
      setFile(url);
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
    }
  };

  // const onDrop = (acceptedFiles) => {
  //   setFile(acceptedFiles[0]);
  //   setFileUrl(URL.createObjectURL(acceptedFiles[0]));
  // };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    maxSize: 5000000,
    // noClick: true,
    // noKeyboard: true,
  });
  console.log(profileImage);
  const onSubmit = async (data) => {
    try {
      const formData = {
        walletAddress: currentAccount,
        userName: data.userName,
        profileImage: fileUrl,
        email: data.email,
        description: data.description,
        socialLinks: {
          website: data.website,
          facebook: data.facebook,
          twitter: data.twitter,
          instagram: data.instagram,
        },
      };
      const response = await axios.post("/api/user/userDetails", formData);

      setUserData({
        walletAddress: response.data.user.walletAddress,
        profileImage: response.data.user.profileImage,
        userName: response.data.user.userName,
      });
      alert(response.data.message);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className={Style.account}>
      <div className={Style.account_info}>
        <h1>Profile settings</h1>
        <p>
          You can set your preferred display name, create your profile URL, and
          manage other personal settings.
        </p>
      </div>

      <div className={Style.account_box}>
        <div className={Style.account_box_img} {...getRootProps()}>
          <input {...getInputProps()} />
          <Image
            src={fileUrl}
            alt="account upload"
            width={150}
            height={150}
            className={Style.account_box_img_img}
          />
          <p className={Style.account_box_img_para}>Change Image</p>
        </div>

        <div className={Style.account_box_from}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={Style.Form_box_input}>
              <label htmlFor="userName">Username</label>
              <input
                type="text"
                {...register("userName")}
                placeholder="Enter your name"
                className={Style.Form_box_input_userName}
              />
            </div>

            <div className={Style.Form_box_input}>
              <label htmlFor="email">Email</label>
              <div className={Style.Form_box_input_box}>
                <div className={Style.Form_box_input_box_icon}>
                  <IoMail />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="Enter your Email"
                  className={Style.Form_box_input_userName}
                />
              </div>
            </div>

            <div className={Style.Form_box_input}>
              <label htmlFor="description">Description</label>
              <textarea
                {...register("description")}
                cols="30"
                rows="6"
                placeholder="something about yourself in a few words"
                className={Style.Form_box_input_userName}
              ></textarea>
            </div>

            <div className={Style.Form_box_input}>
              <label htmlFor="website">Website</label>
              <div className={Style.Form_box_input_box}>
                {/* <div className={Style.Form_box_input_box_icon}>
                  <CgWebsite />
                </div> */}
                <input
                  type="text"
                  {...register("website")}
                  placeholder="website"
                  className={Style.Form_box_input_userName}
                />
              </div>
            </div>

            <div className={Style.Form_box_input}>
              <label htmlFor="facebook">Facebook</label>
              <div className={Style.Form_box_input_box}>
                {/* <div className={Style.Form_box_input_box_icon}>
                  <TiSocialFacebook />
                </div> */}
                <input
                  type="text"
                  {...register("facebook")}
                  placeholder="http://facebook.com/yourprofile"
                  className={Style.Form_box_input_userName}
                />
              </div>
            </div>

            <div className={Style.Form_box_input}>
              <label htmlFor="twitter">Twitter</label>
              <div className={Style.Form_box_input_box}>
                {/* <div className={Style.Form_box_input_box_icon}>
                  <TiSocialTwitter />
                </div> */}
                <input
                  type="text"
                  {...register("twitter")}
                  placeholder="http://twitter.com/yourprofile"
                  className={Style.Form_box_input_userName}
                />
              </div>
            </div>

            <div className={Style.Form_box_input}>
              <label htmlFor="instagram">Instagram</label>
              <div className={Style.Form_box_input_box}>
                {/* <div className={Style.Form_box_input_box_icon}>
                  <TiSocialInstagram />
                </div> */}
                <input
                  type="text"
                  {...register("instagram")}
                  placeholder="http://instagram.com/yourprofile"
                  className={Style.Form_box_input_userName}
                />
              </div>
            </div>

            <div className={Style.Form_box_input}>
              <label htmlFor="wallet">Wallet address</label>
              <div className={Style.Form_box_input_box}>
                {/* <div className={Style.Form_box_input_box_icon}>
                  <IoWalletOutline />
                </div> */}
                <input
                  type="text"
                  {...register("wallet")}
                  placeholder="Your Wallet Address"
                  readOnly
                  className={Style.Form_box_input_userName}
                />
              </div>
            </div>

            <div className={Style.Form_box_btn}>
              <button type="submit" className={Style.button}>
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Account;
