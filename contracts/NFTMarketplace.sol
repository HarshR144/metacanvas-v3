// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _listingIds;
    Counters.Counter private _itemsSold;
    
    address payable owner;
    uint256 listingPrice = 0.005 ether;
    
    enum ListingType { DirectSale, Auction }
    
    struct Listing {
        uint256 listingId;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        ListingType listingType;
        uint256 startPrice;
        uint256 buyoutPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool isActive;
        uint256 likesCount;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(uint256 => Listing) private idToListing;
    mapping(uint256 => Bid[]) private listingToBids;
    mapping(uint256 => mapping(address => bool)) private nftLikes;
    mapping(address => uint256[]) private userLikedNFTs;

    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        ListingType listingType,
        uint256 startPrice,
        uint256 buyoutPrice,
        uint256 endTime
    );

    event ListingSold(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price
    );

    event BidPlaced(uint256 indexed listingId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed listingId, address winner, uint256 amount);
    event NFTLiked(uint256 indexed tokenId, address indexed liker);
    event NFTUnliked(uint256 indexed tokenId, address indexed unliker);

    constructor() ERC721("MetaCanvas Token", "MCT") {
        owner = payable(msg.sender);
    }

    function createToken(
        string memory tokenURI,
        uint256 price,
        ListingType listingType,
        uint256 startPrice,
        uint256 buyoutPrice,
        uint256 auctionDuration
    ) public payable returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        createListing(newTokenId, price, listingType, startPrice, buyoutPrice, auctionDuration);
        
        return newTokenId;
    }

    function createListing(
        uint256 tokenId,
        uint256 price,
        ListingType listingType,
        uint256 startPrice,
        uint256 buyoutPrice,
        uint256 auctionDuration
    ) private {
        require(msg.value == listingPrice, "Price must be equal to listing price");
        
        if (listingType == ListingType.DirectSale) {
            require(price > 0, "Price must be at least 1 wei");
        } else {
            require(startPrice > 0, "Start price must be at least 1 wei");
            if(buyoutPrice != 0){
                require(buyoutPrice > startPrice, "Buyout price must be greater than start price");
            }
            require(auctionDuration > 0, "Auction duration must be greater than 0");
        }

        _listingIds.increment();
        uint256 listingId = _listingIds.current();

        idToListing[listingId] = Listing(
            listingId,
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            listingType,
            startPrice,
            buyoutPrice,
            0,
            address(0),
            listingType == ListingType.Auction ? block.timestamp + auctionDuration : 0,
            true,
            0
        );

        _transfer(msg.sender, address(this), tokenId);

        emit ListingCreated(
            listingId,
            tokenId,
            msg.sender,
            price,
            listingType,
            startPrice,
            buyoutPrice,
            idToListing[listingId].endTime
        );
    }

    function resellToken(
        uint256 tokenId,
        uint256 oldListingId,
        uint256 price,
        ListingType listingType,
        uint256 startPrice,
        uint256 buyoutPrice,
        uint256 auctionDuration
    ) public payable {
        require(ownerOf(tokenId) == msg.sender, "Only token owner can resell");
        require(msg.value == listingPrice, "Must pay listing price");
        idToListing[oldListingId].tokenId = 0;
        createListing(tokenId, price, listingType, startPrice, buyoutPrice, auctionDuration);
        
    }    
    function placeBid(uint256 listingId) public payable nonReentrant {
        Listing storage listing = idToListing[listingId];
        require(listing.isActive && listing.listingType == ListingType.Auction, "Invalid auction");
        require(block.timestamp < listing.endTime, "Auction ended");
        require(msg.value > listing.highestBid, "Bid too low");
        require(msg.value >= listing.startPrice, "Bid below start price");

        if (listing.highestBidder != address(0)) {
            payable(listing.highestBidder).transfer(listing.highestBid);
        }

        listing.highestBid = msg.value;
        listing.highestBidder = msg.sender;
        listingToBids[listingId].push(Bid(msg.sender, msg.value, block.timestamp));

        emit BidPlaced(listingId, msg.sender, msg.value);

        if (listing.buyoutPrice != 0 && msg.value >= listing.buyoutPrice) {
            listing.isActive = false;
            _transfer(address(this), msg.sender, listing.tokenId);
            payable(listing.seller).transfer(msg.value);
            _itemsSold.increment();
            emit AuctionEnded(listingId, msg.sender, msg.value);
        }
    }

    function endAuction(uint256 listingId) public nonReentrant {
        Listing storage listing = idToListing[listingId];
        require(listing.isActive && listing.listingType == ListingType.Auction, "Invalid auction");
        require(
            block.timestamp >= listing.endTime,
            "Auction cannot be ended yet"
        );

        listing.isActive = false;

        if (listing.highestBidder != address(0)) {
            _transfer(address(this), listing.highestBidder, listing.tokenId);
            payable(listing.seller).transfer(listing.highestBid);
            _itemsSold.increment();
            emit AuctionEnded(listingId, listing.highestBidder, listing.highestBid);
        } else {
            _transfer(address(this), listing.seller, listing.tokenId);
        }
    }

    function createMarketSale(uint256 listingId) public payable nonReentrant {
        Listing storage listing = idToListing[listingId];
        require(listing.isActive && listing.listingType == ListingType.DirectSale, "Invalid listing");
        require(msg.value == listing.price, "Wrong price");

        listing.isActive = false;
        listing.owner = payable(msg.sender);
        _itemsSold.increment();
        
        _transfer(address(this), msg.sender, listing.tokenId);
        payable(owner).transfer(listingPrice);
        payable(listing.seller).transfer(msg.value);

        emit ListingSold(listingId, listing.tokenId, listing.seller, msg.sender, msg.value);
    }

    function likeNFT(uint256 tokenId) public {
        require(!nftLikes[tokenId][msg.sender], "Already liked");
        
        nftLikes[tokenId][msg.sender] = true;
        userLikedNFTs[msg.sender].push(tokenId);
        
        for (uint256 i = 1; i <= _listingIds.current(); i++) {
            if (idToListing[i].tokenId == tokenId && idToListing[i].isActive) {
                idToListing[i].likesCount++;
            }
        }

        emit NFTLiked(tokenId, msg.sender);
    }

    function unlikeNFT(uint256 tokenId) public {
        require(nftLikes[tokenId][msg.sender], "Not liked");
        
        nftLikes[tokenId][msg.sender] = false;
        
        uint256[] storage userLikes = userLikedNFTs[msg.sender];
        for (uint256 i = 0; i < userLikes.length; i++) {
            if (userLikes[i] == tokenId) {
                userLikes[i] = userLikes[userLikes.length - 1];
                userLikes.pop();
                break;
            }
        }

        for (uint256 i = 1; i <= _listingIds.current(); i++) {
            if (idToListing[i].tokenId == tokenId && idToListing[i].isActive) {
                idToListing[i].likesCount--;
            }
        }

        emit NFTUnliked(tokenId, msg.sender);
    }

    // Consolidated fetch function
    function fetchNFTs(address user) public view returns (
        Listing[] memory activeListings,
        Listing[] memory userListings,
        Listing[] memory userOwned,
        uint256[] memory likedNFTs
    ) {
        uint256 totalItems = _listingIds.current();
        
        // Count items for each category
        uint256 activeCount = 0;
        uint256 userListingCount = 0;
        uint256 userOwnedCount = 0;
        
        for (uint256 i = 1; i <= totalItems; i++) {
            Listing storage item = idToListing[i];
            if (item.isActive) activeCount++;
            if (item.seller == user && item.isActive) userListingCount++;
            if (item.tokenId != 0 && ownerOf(item.tokenId) == user) userOwnedCount++;
        }
        
        // Initialize arrays
        activeListings = new Listing[](activeCount);
        userListings = new Listing[](userListingCount);
        userOwned = new Listing[](userOwnedCount);
        
        // Fill arrays
        uint256 activeIndex = 0;
        uint256 userListingIndex = 0;
        uint256 userOwnedIndex = 0;
        
        for (uint256 i = 1; i <= totalItems; i++) {
            Listing storage item = idToListing[i];
            
            if (item.isActive) {
                activeListings[activeIndex] = item;
                activeIndex++;
            }
            
            if (item.seller == user && item.isActive) {
                userListings[userListingIndex] = item;
                userListingIndex++;
            }
            
            if (item.tokenId != 0 && ownerOf(item.tokenId) == user) {
                userOwned[userOwnedIndex] = item;
                userOwnedIndex++;
            }
        }
        
        // Return liked NFTs
        likedNFTs = userLikedNFTs[user];
    }

    // Helper functions
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }
    
    function updateListingPrice(uint256 _listingPrice) public payable {
        require(msg.sender == owner, "Only owner");
        listingPrice = _listingPrice;
    }
    
    function fetchListingBids(uint256 listingId) public view returns (Bid[] memory) {
        return listingToBids[listingId];
    }
    
    function hasLiked(uint256 tokenId, address user) public view returns (bool) {
        return nftLikes[tokenId][user];
    }
}