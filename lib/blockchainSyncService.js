// import { ethers } from 'ethers';
// import { User, NFT, Listing } from './models';
// import { NFTMarketplaceABI, NFTMarketplaceAddress } from '../Context/constants';

// // Assuming you have your contract ABI and address
// class BlockchainSyncService {
//     constructor(provider) {
//         this.provider = provider;
//         this.contract = new ethers.Contract(
//             NFTMarketplaceAddress,
//             NFTMarketplaceABI,
//             provider
//         );
//     }

//     async startSync() {
//         // Listen to all relevant events
//         this.listenToListingCreated();
//         this.listenToListingSold();
//         this.listenToBidPlaced();
//         this.listenToAuctionEnded();
//         this.listenToNFTLiked();
//         this.listenToNFTUnliked();
//     }

//     // Event Listeners
//     listenToListingCreated() {
//         this.contract.on('ListingCreated', async (
//             listingId,
//             tokenId,
//             seller,
//             owner,
//             price,
//             listingType,
//             startPrice,
//             buyoutPrice,
//             endTime,
//             event
//         ) => {
//             try {
//                 // Get token URI and metadata from the contract
//                 const tokenURI = await this.contract.tokenURI(tokenId);
//                 const metadata = await this.fetchMetadata(tokenURI);

//                 // Find or create user
//                 const user = await this.findOrCreateUser(seller);

//                 // Create NFT if it doesn't exist
//                 let nft = await NFT.findOne({ tokenId: tokenId.toString() });
//                 if (!nft) {
//                     nft = await NFT.create({
//                         tokenId: tokenId.toString(),
//                         contractAddress: NFT_MARKETPLACE_ADDRESS.toLowerCase(),
//                         creator: user._id,
//                         owner: user._id,
//                         metadata,
//                         tokenURI
//                     });

//                     // Update user's owned NFTs
//                     await User.findByIdAndUpdate(user._id, {
//                         $addToSet: { ownedNFTs: nft._id }
//                     });
//                 }

//                 // Create listing
//                 const listing = await Listing.create({
//                     listingId: listingId.toString(),
//                     nft: nft._id,
//                     seller: user._id,
//                     listingType,
//                     price: listingType === 'DirectSale' ? price.toString() : null,
//                     startPrice: listingType === 'Auction' ? startPrice.toString() : null,
//                     buyoutPrice: listingType === 'Auction' ? buyoutPrice.toString() : null,
//                     endTime: listingType === 'Auction' ? new Date(endTime * 1000) : null,
//                     status: 'Active'
//                 });

//                 // Update NFT with active listing
//                 await NFT.findByIdAndUpdate(nft._id, {
//                     activeListing: listing._id
//                 });

//                 // Update user's listed NFTs
//                 await User.findByIdAndUpdate(user._id, {
//                     $addToSet: { listedNFTs: listing._id }
//                 });

//             } catch (error) {
//                 console.error('Error processing ListingCreated event:', error);
//             }
//         });
//     }

//     listenToListingSold() {
//         this.contract.on('ListingSold', async (
//             listingId,
//             tokenId,
//             seller,
//             buyer,
//             price,
//             event
//         ) => {
//             try {
//                 // Find or create users
//                 const sellerUser = await this.findOrCreateUser(seller);
//                 const buyerUser = await this.findOrCreateUser(buyer);

//                 // Update listing status
//                 const listing = await Listing.findOneAndUpdate(
//                     { listingId: listingId.toString() },
//                     { 
//                         status: 'Sold',
//                         $set: { 'buyer': buyerUser._id }
//                     },
//                     { new: true }
//                 );

//                 if (!listing) return;

//                 // Update NFT ownership
//                 const nft = await NFT.findOneAndUpdate(
//                     { _id: listing.nft },
//                     { 
//                         owner: buyerUser._id,
//                         activeListing: null
//                     }
//                 );

//                 // Update users' NFT arrays
//                 await User.findByIdAndUpdate(sellerUser._id, {
//                     $pull: { ownedNFTs: nft._id }
//                 });

//                 await User.findByIdAndUpdate(buyerUser._id, {
//                     $addToSet: { ownedNFTs: nft._id }
//                 });

//             } catch (error) {
//                 console.error('Error processing ListingSold event:', error);
//             }
//         });
//     }

//     listenToBidPlaced() {
//         this.contract.on('BidPlaced', async (
//             listingId,
//             bidder,
//             amount,
//             event
//         ) => {
//             try {
//                 const bidderUser = await this.findOrCreateUser(bidder);

//                 await Listing.findOneAndUpdate(
//                     { listingId: listingId.toString() },
//                     {
//                         highestBid: amount.toString(),
//                         highestBidder: bidderUser._id,
//                         $push: {
//                             bids: {
//                                 bidder: bidderUser._id,
//                                 amount: amount.toString(),
//                                 timestamp: new Date()
//                             }
//                         }
//                     }
//                 );
//             } catch (error) {
//                 console.error('Error processing BidPlaced event:', error);
//             }
//         });
//     }

//     listenToAuctionEnded() {
//         this.contract.on('AuctionEnded', async (
//             listingId,
//             winner,
//             amount,
//             event
//         ) => {
//             try {
//                 const listing = await Listing.findOne({ listingId: listingId.toString() });
//                 if (!listing) return;

//                 const winnerUser = await this.findOrCreateUser(winner);
//                 const sellerUser = await User.findById(listing.seller);

//                 // Update listing status
//                 await Listing.findByIdAndUpdate(listing._id, {
//                     status: 'Sold'
//                 });

//                 // Update NFT ownership
//                 const nft = await NFT.findByIdAndUpdate(listing.nft, {
//                     owner: winnerUser._id,
//                     activeListing: null
//                 });

//                 // Update users' NFT arrays
//                 await User.findByIdAndUpdate(sellerUser._id, {
//                     $pull: { ownedNFTs: nft._id }
//                 });

//                 await User.findByIdAndUpdate(winnerUser._id, {
//                     $addToSet: { ownedNFTs: nft._id }
//                 });

//             } catch (error) {
//                 console.error('Error processing AuctionEnded event:', error);
//             }
//         });
//     }

//     listenToNFTLiked() {
//         this.contract.on('NFTLiked', async (tokenId, liker, event) => {
//             try {
//                 const likerUser = await this.findOrCreateUser(liker);
                
//                 // Update NFT likes count
//                 await NFT.findOneAndUpdate(
//                     { tokenId: tokenId.toString() },
//                     { $inc: { likesCount: 1 } }
//                 );

//                 // Update user's liked NFTs
//                 await User.findByIdAndUpdate(likerUser._id, {
//                     $addToSet: { likedNFTs: tokenId.toString() }
//                 });

//             } catch (error) {
//                 console.error('Error processing NFTLiked event:', error);
//             }
//         });
//     }

//     listenToNFTUnliked() {
//         this.contract.on('NFTUnliked', async (tokenId, unliker, event) => {
//             try {
//                 const unlikerUser = await this.findOrCreateUser(unliker);

//                 // Update NFT likes count
//                 await NFT.findOneAndUpdate(
//                     { tokenId: tokenId.toString() },
//                     { $inc: { likesCount: -1 } }
//                 );

//                 // Update user's liked NFTs
//                 await User.findByIdAndUpdate(unlikerUser._id, {
//                     $pull: { likedNFTs: tokenId.toString() }
//                 });

//             } catch (error) {
//                 console.error('Error processing NFTUnliked event:', error);
//             }
//         });
//     }

//     // Helper functions
//     async findOrCreateUser(address) {
//         let user = await User.findOne({ walletAddress: address.toLowerCase() });
//         if (!user) {
//             user = await User.create({
//                 walletAddress: address.toLowerCase(),
//                 username: `User-${address.slice(0, 6)}`
//             });
//         }
//         return user;
//     }

//     async fetchMetadata(tokenURI) {
//         try {
//             const response = await fetch(tokenURI);
//             const metadata = await response.json();
//             return metadata;
//         } catch (error) {
//             console.error('Error fetching metadata:', error);
//             return null;
//         }
//     }

//     // Initial sync function to sync past events
//     async syncPastEvents(fromBlock = 0) {
//         const events = [
//             'ListingCreated',
//             'ListingSold',
//             'BidPlaced',
//             'AuctionEnded',
//             'NFTLiked',
//             'NFTUnliked'
//         ];

//         for (const eventName of events) {
//             const filter = this.contract.filters[eventName]();
//             const events = await this.contract.queryFilter(filter, fromBlock, 'latest');

//             console.log(`Syncing past ${eventName} events...`);
            
//             for (const event of events) {
//                 // Process each event based on its type
//                 switch (eventName) {
//                     case 'ListingCreated':
//                         await this.processListingCreated(event);
//                         break;
//                     case 'ListingSold':
//                         await this.processListingSold(event);
//                         break;
//                     // Add cases for other events
//                 }
//             }
//         }
//     }
// }

// // Usage example:
// // const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
// // const syncService = new BlockchainSyncService(provider);
// // syncService.startSync();
// // For initial sync: syncService.syncPastEvents(startBlockNumber);