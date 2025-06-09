import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import axios from "axios";
import LikedNFT from "../lib/models/like";
//INTERNAL IMPORT
import {
  NFTMarketplaceAddress,
  NFTMarketplaceABI,
  transferFundsAddress,
  transferFundsABI,
  handleNetworkSwitch,
} from "./constants";

// Environment variables
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
const PINATA_GATEWAY_URL =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || "https://gateway.pinata.cloud";
const PINATA_API_URL =
  process.env.NEXT_PUBLIC_PINATA_API_URL || "https://api.pinata.cloud";

//---FETCHING SMART CONTRACT
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplaceABI,
    signerOrProvider
  );

//---CONNECTING WITH SMART CONTRACT
const connectingWithSmartContract = async () => {
  try {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = fetchContract(signer);
    return contract;
  } catch (error) {
    console.log("Something went wrong while connecting with contract", error);
  }
};

export const NFTMarketplaceContext = React.createContext();

export const NFTMarketplaceProvider = ({ children }) => {
  const titleData = "Discover, collect, and sell NFTs";
  const router = useRouter();

  //------USESTATE
  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [userName, setUserName] = useState("");
  const [currentNFT, setCurrentNFT] = useState({});
  
  const [tracker, setTracker] = useState(null);

  useEffect(() => {
    // Dynamic import for client-side only
    if (typeof window !== 'undefined') {
      import('../lib/tracking').then((module) => {
        setTracker(module.default);
      }).catch((error) => {
        console.warn('Failed to load interaction tracker:', error);
      });
    }
  }, []);

  // update profile image
  const setUserData = ({
    walletAddress,
    profileImage: newImage,
    userName: newUserName,
  }) => {
    if (walletAddress == currentAccount) {
      setUserName(newUserName);
      setProfileImage(newImage);
      console.log(newUserName);
      localStorage.setItem("profileImage", newImage);
      localStorage.setItem("userName", newUserName);
    }
  };

  useEffect(() => {
    const storedProfileImage = localStorage.getItem("profileImage");
    const storedUserName = localStorage.getItem("userName");

    if (storedProfileImage) {
      setProfileImage(storedProfileImage);
    }

    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  const setNFT = (nft) => {
    setCurrentNFT(nft);
    localStorage.setItem("currentNFT", JSON.stringify(nft));
  };

  useEffect(() => {
    const savedNft = localStorage.getItem("currentNFT");
    if (savedNft) {
      setCurrentNFT(JSON.parse(savedNft));
    }
  }, []);

  const updateBalance = async (address) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.utils.formatEther(balance);
      setAccountBalance(formattedBalance);
    } catch (error) {
      console.log("Error getting balance:", error);
    }
  };

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else {
      const newAccount = accounts[0];
      localStorage.removeItem("walletAddress");
      setCurrentAccount(newAccount);
      localStorage.setItem("walletAddress", newAccount);
      await updateBalance(newAccount);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        if (!window.ethereum) {
          setError("Please install MetaMask");
          setOpenError(true);
          return;
        }

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        const storedAddress = localStorage.getItem("walletAddress");
        if (storedAddress) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (
            accounts.length > 0 &&
            accounts[0].toLowerCase() === storedAddress.toLowerCase()
          ) {
            setCurrentAccount(accounts[0]);
            await updateBalance(accounts[0]);
          } else {
            handleDisconnect();
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.log("Error initializing wallet:", error);
        handleDisconnect();
      }
    };

    if (!isInitialized) {
      initializeWallet();
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("Please install MetaMask");
        setOpenError(true);
        return;
      }

      await handleNetworkSwitch();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const account = accounts[0];
      setCurrentAccount(account);
      localStorage.setItem("walletAddress", account);
      await updateBalance(account);
      await connectingWithSmartContract();
    } catch (error) {
      setError("Error while connecting to wallet");
      setOpenError(true);
      console.log("Connection error:", error);
    }
  };

  const disconnectWallet = async () => {
    try {
      handleDisconnect();
    } catch (error) {
      setError("Error while disconnecting the wallet");
      setOpenError(true);
    }
  };

  const handleDisconnect = () => {
    setCurrentAccount("");
    setAccountBalance("");
    setProfileImage("");
    setUserName("");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("profileImage");
    localStorage.removeItem("userName");
  };

  const uploadToPinata = async (file) => {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      setError("Pinata API configuration is missing");
      setOpenError(true);
      return;
    }

    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios({
          method: "post",
          url: `${PINATA_API_URL}/pinning/pinFileToIPFS`,
          data: formData,
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `${PINATA_GATEWAY_URL}/ipfs/${response.data.IpfsHash}`;
        return ImgHash;
      } catch (error) {
        setError("Unable to upload image to Pinata");
        setOpenError(true);
        console.log(error);
      }
    }
    setError("File Is Missing");
    setOpenError(true);
  };

  const createNFT = async (
    name,
    description,
    imageFile,
    price,
    isAuction = false,
    startPrice = 0,
    buyoutPrice = 0,
    duration = 0,
    attributes = [], // Added attributes parameter with default empty array
    tags = [] // Add tags for better categorization
  ) => {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      setError("Pinata API configuration is missing");
      setOpenError(true);
      return;
    }

    try {
      if (!name || !description || !imageFile || (!isAuction && !price)) {
        setError("Missing required fields");
        setOpenError(true);
        return;
      }

      const imageUrl = imageFile;
      const metadata = JSON.stringify({
        name,
        description,
        image: imageUrl,
        attributes: attributes,
        tags: tags // Use the passed attributes array
      });

      const metadataResponse = await axios.post(
        `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
        metadata,
        {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const tokenURI = `${PINATA_GATEWAY_URL}/ipfs/${metadataResponse.data.IpfsHash}`;
      const contract = await connectingWithSmartContract();
      const listingPrice = await contract.getListingPrice();
      const priceInWei = ethers.utils.parseEther(price.toString());

      let transaction;
      if (isAuction) {
        const startPriceWei = ethers.utils.parseEther(startPrice.toString());
        const buyoutPriceWei = ethers.utils.parseEther(buyoutPrice.toString());
        const durationInSeconds = duration * 60* 24 * 60;

        transaction = await contract.createToken(
          tokenURI,
          priceInWei,
          1,
          startPriceWei,
          buyoutPriceWei,
          durationInSeconds,
          { value: listingPrice }
        );
      } else {
        transaction = await contract.createToken(
          tokenURI,
          priceInWei,
          0,
          0,
          0,
          0,
          { value: listingPrice }
        );
      }

      // await transaction.wait();
      // return transaction.hash;
      const receipt = await transaction.wait(); // Wait for the transaction to be mined
      const event = receipt.events.find((e) => e.event === "Transfer"); // Look for the Transfer event
      const tokenId = event.args.tokenId.toNumber(); // Extract token ID
      console.log("tokenId in context: ", tokenId);
      
       if (tracker && currentAccount && tokenId) {
      await tracker.trackNFTCreation(tokenId.toString(), currentAccount, {
        name,
        description,
        tags,
        price: price.toString(),
        isAuction,
        attributes,
        imageUrl,
        transactionHash: receipt.transactionHash
      });
    }
      
      
      return tokenId; // Return the token ID instead of transaction hash
      
    } catch (error) {
      setError(error.message || "Error creating NFT");
      setOpenError(true);
      throw error;
    }
  };

  const resellNFT = async (
    tokenId,
    oldListingId,
    price,
    isAuction = false,
    startPrice = 0,
    buyoutPrice = 0,
    duration = 0
  ) => {
    try {
      const contract = await connectingWithSmartContract();
      const listingPrice = await contract.getListingPrice();
      const priceInWei = ethers.utils.parseEther(price.toString());

      let transaction;
      if (isAuction) {
        const startPriceWei = ethers.utils.parseEther(startPrice.toString());
        const buyoutPriceWei = ethers.utils.parseEther(buyoutPrice.toString());
        const durationInSeconds = duration * 24 * 60 * 60;

        transaction = await contract.resellToken(
          tokenId,
          oldListingId,
          priceInWei,
          1,
          startPriceWei,
          buyoutPriceWei,
          durationInSeconds,
          { value: listingPrice }
        );
      } else {
        console.log("Direct sale happening");
        transaction = await contract.resellToken(
          tokenId,
          oldListingId,
          priceInWei,
          0,
          0,
          0,
          0,
          { value: listingPrice }
        );
      }

      await transaction.wait();
      return transaction.hash;
    } catch (error) {
      setError("Error reselling NFT");
      setOpenError(true);
      console.log("Error while reselling NFT", error);
      throw error;
    }
  };

  const placeBid = async (listingId, bidAmount) => {
    try {
      const contract = await connectingWithSmartContract();
      const bidAmountWei = ethers.utils.parseEther(bidAmount.toString());

      const transaction = await contract.placeBid(listingId, {
        value: bidAmountWei,
      });

      await transaction.wait();
      
      // Track bid interaction
      if (tracker && currentNFT) {
        tracker.trackBid(currentNFT.tokenId, currentAccount, bidAmount.toString());
      }

      
      return transaction.hash;
    } catch (error) {
      setError("Error placing bid");
      setOpenError(true);
    }
  };

  const buyNFT = async (listingId, price) => {
    try {
      const contract = await connectingWithSmartContract();
      const transaction = await contract.createMarketSale(listingId, {
        value: ethers.utils.parseEther(price.toString()),
      });
      await transaction.wait();
      
       // Track purchase interaction
      if (tracker && currentNFT) {
        tracker.trackPurchase(
          currentNFT.tokenId, 
          currentAccount, 
          price.toString(), 
          transaction.hash
        );
      }

      
      return transaction.hash;
    } catch (error) {
      throw error;
    }
  };


  const syncNFTsToDatabase = async (nfts) => {
    try {
      await axios.post('/api/nft/sync', { nfts });
      console.log('NFTs synced to database');
    } catch (error) {
      console.error('Error syncing NFTs:', error);
    }
  };

  const fetchAllNFTs = async () => {
    try {
      const contract = await connectingWithSmartContract();
      const [activeListings, userListings, userOwned, likedNFTs] =
        await contract.fetchNFTs(currentAccount);
      // console.log(activeListings);
    
      const formattedData = {
        activeListings: await formatListings(activeListings, contract),
        userListings: await formatListings(userListings, contract),
        userOwned: await formatListings(userOwned, contract),
        likedNFTs,
      };

      // Sync all NFTs to database
      if (formattedData.activeListings.length > 0) {
        syncNFTsToDatabase(formattedData.activeListings);
      }

      return formattedData;    
    
    } catch (error) {
      setError("Error fetching NFTs");
      setOpenError(true);
      console.error(error);
      return {
        activeListings: [],
        userListings: [],
        userOwned: [],
        likedNFTs: [],
      };
    }
  };

  const fetchAllListings = async () => {
    const { activeListings } = await fetchAllNFTs();
    return activeListings;
  };

  const fetchMyLikedNFTs = async () => {
    const { likedNFTs } = await fetchAllNFTs();
    return likedNFTs;
  };

  const formatListings = async (listings, contract) => {
    
    const nftIds = listings.map(item => item.tokenId.toString());
    let likeCounts = {};
    let userLikedMap = {};
  
    try {
      if(nftIds.length != 0){
          const response = await axios.get(`/api/nft/nftLikeCountArray`, {
            params: { nftIds, walletAddress: currentAccount }, // Pass as an array, no join
            paramsSerializer: (params) => {
              return new URLSearchParams(params).toString();
            }
          });      
          if (response.status == 200) {
            likeCounts = response.data.likeCounts || {};
            userLikedMap = response.data.userLikedMap || {};
          }
      }
    } catch (error) {
      console.error("Error fetching like counts:", error);
    }
      
    
    const formattedListings = await Promise.all(
      listings.map(async (item) => {
        const tokenURI = await contract.tokenURI(item.tokenId);
        let metadata = {};

        if (tokenURI) {
          try {
            const response = await axios.get(tokenURI);
            metadata = response.data;
          } catch (error) {
            console.error("Error fetching metadata:", error);
            metadata = {};
          }
        }
      
        return {
          listingId: item.listingId.toString(),
          tokenId: item.tokenId.toString(),
          seller: item.seller,
          owner: item.owner,
          price: ethers.utils.formatEther(item.price),
          listingType: item.listingType,
          startPrice: item.startPrice
            ? ethers.utils.formatEther(item.startPrice)
            : null,
          buyoutPrice: item.buyoutPrice
            ? ethers.utils.formatEther(item.buyoutPrice)
            : null,
          highestBid: item.highestBid
            ? ethers.utils.formatEther(item.highestBid)
            : null,
          highestBidder: item.highestBidder,
          endTime: item.endTime
            ? new Date(item.endTime.toNumber() * 1000)
            : null,
          isActive: item.isActive,
          likesCount: likeCounts[item.tokenId.toString()] || 0,
          userHasLiked: userLikedMap[item.tokenId.toString()] || false,
          tokenURI,
          tags: metadata.tags || [],
          metadata: {
            name: metadata.name || "",
            description: metadata.description || "",
            image: metadata.image || "",
            attributes: metadata.attributes || [],
            
          },
        };
      })
    );

    return formattedListings;
  };

  const fetchMyListedNFTs = async () => {
    const { userListings } = await fetchAllNFTs();
    return userListings || [];
  };

  const fetchMyOwnedNFTs = async () => {
    const { userOwned } = await fetchAllNFTs();
    return userOwned || [];
  };

  const endAuction = async (listingId) => {
    try {
      const contract = await connectingWithSmartContract();
      const transaction = await contract.endAuction(listingId);
      await transaction.wait();
      return transaction.hash;
    } catch (error) {
      setError("Error ending auction");
      setOpenError(true);
      console.error(error);
      throw error;
    }
  };


  const fetchRecommendations = async (limit = 10) => {
    try {
      const response = await axios.get('/api/recommendations/get', {
        params: { walletAddress: currentAccount, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return { recommendations: [] };
    }
  };
  

  return (
    <NFTMarketplaceContext.Provider
      value={{
        profileImage,
        currentAccount,
        titleData,
        openError,
        error,
        accountBalance,
        userName,
        uploadToPinata,
        connectWallet,
        currentNFT,
        setNFT,
        setOpenError,
        disconnectWallet,
        setUserData,
        createNFT,
        placeBid,
        buyNFT,
        fetchAllListings,
        fetchMyLikedNFTs,
        fetchMyListedNFTs,
        fetchMyOwnedNFTs,
        fetchAllNFTs,
        resellNFT,
        endAuction,
        fetchRecommendations,
      }}
    >
      {children}
    </NFTMarketplaceContext.Provider>
  );
};
export { connectingWithSmartContract };
