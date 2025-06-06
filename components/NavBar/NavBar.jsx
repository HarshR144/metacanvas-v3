import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { DiJqueryLogo } from "react-icons/di";
import { MdNotifications } from "react-icons/md";
import { BsSearch } from "react-icons/bs";
import { CgMenuRight } from "react-icons/cg";
import { FiSun, FiMoon, FiUpload, FiImage  } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/router";

import Style from "./NavBar.module.css";
import { HelpCenter, Notification, Profile, SideBar } from "./index";
import { Button, Error } from "../componentsindex";
import images from "../../img";
import { NFTMarketplaceContext } from "../../Context/NFTMarketplaceContext";
import { fetchUser } from "../../services/userService/fetchUser";

const NavBar = () => {
  const [help, setHelp] = useState(false);
  const [notification, setNotification] = useState(false);
  const [profile, setProfile] = useState(false);
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const router = useRouter();
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Default to true

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("isDarkTheme");
      if (savedTheme !== null) {
        setIsDarkTheme(JSON.parse(savedTheme));
      } else {
        setIsDarkTheme(
          window.matchMedia("(prefers-color-scheme: dark)").matches
        );
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isDarkTheme", JSON.stringify(isDarkTheme));
    }

    const root = document.documentElement;
    if (isDarkTheme) {
      root.setAttribute("data-theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
    }
  }, [isDarkTheme]);

  const handleSearch = () => {
    if (router.pathname !== "/searchPage") {
      router.push({
        pathname: "/searchPage",
        query: { search: searchItem },
      });
    }
    setSearchItem("");
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchItem), 500);
    return () => clearTimeout(timer);
  }, [searchItem]);

  useEffect(() => {
    if (debouncedSearch) {
      handleSearch();
    }
  }, [debouncedSearch]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  const closeAllMenus = (exceptMenu) => {
    if (exceptMenu !== "help") setHelp(false);
    if (exceptMenu !== "notification") setNotification(false);
    if (exceptMenu !== "profile") setProfile(false);
    if (exceptMenu !== "createDropdown") setShowCreateDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideMenu =
        event.target.closest(`.${Style.navbar_container_right_help_box}`) ||
        event.target.closest(`.${Style.navbar_container_right_notify}`) ||
        event.target.closest(`.${Style.navbar_container_right_profile}`) ||
        event.target.closest(`.${Style.create_dropdown}`) ||
        event.target.closest(`.${Style.noselect}`);

      if (!isClickInsideMenu) {
        closeAllMenus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleHelp = () => {
    closeAllMenus("help");
    setHelp((prev) => !prev);
  };

  const toggleNotification = () => {
    closeAllMenus("notification");
    setNotification((prev) => !prev);
  };

  const toggleProfile = () => {
    closeAllMenus("profile");
    setProfile((prev) => !prev);
  };

  const toggleCreateDropdown = () => {
    closeAllMenus("createDropdown");
    setShowCreateDropdown((prev) => !prev);
  };

  const toggleSideBar = () => {
    setOpenSideMenu((prev) => !prev);
  };

  const handleMouseDown = (event, action) => {
    event.preventDefault();
    action();
  };
  
  const navigateToUploadNFT = () => {
    router.push("/uploadNFT");
    setShowCreateDropdown(false);
  };

  const navigateToGenerateNFT = () => {
    router.push("/generateNFT");
    setShowCreateDropdown(false);
  };

  const {
    currentAccount,
    connectWallet,
    openError,
    disconnectWallet,
    profileImage,
    setUserData,
  } = useContext(NFTMarketplaceContext);

  useEffect(() => {
    if (currentAccount) {
      const loadUser = async () => {
        const userData = await fetchUser(currentAccount);
        if (userData) {
          setUserData(userData);
        }
      };
      loadUser();
    } else {
      setUserData({
        walletAddress: "",
        userName: "",
        profileImage: "",
      });
    }
  }, [currentAccount]);

  return (
    <div className={Style.navbar}>
      <div className={Style.navbar_container}>
        <div className={Style.navbar_container_left}>
          <div className={Style.navbar_container_left_box}>
            <div className={Style.logo}>
              <DiJqueryLogo onClick={() => router.push("/")} />
            </div>
            <div className={Style.navbar_container_left_discover}>
              <Link href="/searchPage">
                <p className={`${Style.noselect} ${Style.exploreLink}`}>
                  Explore
                </p>
              </Link>
            </div>
          </div>
          {router.pathname !== "/searchPage" && (
            <div className={Style.navbar_container_left_box_input}>
              <div className={Style.navbar_container_left_box_input_box}>
                <input
                  type="text"
                  placeholder="Search NFT"
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <BsSearch
                  onClick={handleSearch}
                  className={Style.search_icon}
                />
              </div>
            </div>
          )}
        </div>

        <div className={Style.navbar_container_right}>
          {/* Theme Toggle Button */}
          <div className={Style.navbar_container_right_theme_toggle}>
            <button
              onClick={toggleTheme}
              className={Style.theme_toggle_button}
              aria-label={
                isDarkTheme ? "Switch to light theme" : "Switch to dark theme"
              }
            >
              {isDarkTheme ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>

          <div className={Style.navbar_container_right_help}>
            <p
              onMouseDown={(e) => handleMouseDown(e, toggleHelp)}
              className={Style.noselect}
            >
              Help Center
            </p>
            {help && (
              <div className={Style.navbar_container_right_help_box}>
                <HelpCenter />
              </div>
            )}
          </div>

          <div className={Style.navbar_container_right_notify}>
            <MdNotifications
              className={Style.notify}
              onClick={toggleNotification}
            />
            {notification && <Notification currentAccount={currentAccount} />}
          </div>

          <div className={Style.navbar_container_right_button}>
            {currentAccount == "" ? (
              <Button btnName="Connect" handleClick={connectWallet} />
            ) : (
              <>
                <div className={Style.create_dropdown_container}>
                  <Button
                    btnName="Create"
                    handleClick={toggleCreateDropdown}
                  />
                  {showCreateDropdown && (
                    <div className={Style.create_dropdown}>
                      <div 
                        className={Style.create_dropdown_item}
                        onClick={navigateToUploadNFT}
                      >
                        <FiUpload /> Upload NFT
                      </div>
                      <div 
                        className={Style.create_dropdown_item}
                        onClick={navigateToGenerateNFT}
                      >
                        <FiImage /> Generate NFT
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  style={{ backgroundColor: "red", display: "block" }}
                  btnName="Disconnect"
                  handleClick={disconnectWallet}
                />
              </>
            )}
          </div>

          {currentAccount != "" && (
            <div className={Style.navbar_container_right_profile_box}>
              <div className={Style.navbar_container_right_profile}>
                {profileImage && (
                  <Image
                    src={profileImage || "/default-profile.png"}
                    alt="Profile"
                    width={40}
                    height={40}
                    onClick={toggleProfile}
                    className={Style.navbar_container_right_profile}
                  />
                )}
                {profile && <Profile currentAccount={currentAccount} />}
              </div>
            </div>
          )}

          <div className={Style.navbar_container_right_menuBtn}>
            <CgMenuRight className={Style.menuIcon} onClick={toggleSideBar} />
          </div>
        </div>
      </div>

      {openSideMenu && (
        <div className={Style.sideBar}>
          <SideBar
            setOpenSideMenu={setOpenSideMenu}
            currentAccount={currentAccount}
            connectWallet={connectWallet}
          />
        </div>
      )}

      {openError && <Error />}
    </div>
  );
};

export default NavBar;
