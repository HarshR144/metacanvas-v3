import React, { useState, useEffect, useContext } from 'react';
import { Heart, Eye, TrendingUp, Sparkles, RefreshCw, Clock } from 'lucide-react';
import Link from 'next/link';
import Style from './NFTRecommendations.module.css';
import { NFTMarketplaceContext } from "../../Context/NFTMarketplaceContext";
import tracker from '../../lib/tracking';

const NFTRecommendations = ({ 
  nfts,
  apiBaseUrl = '/api/recommendations', // Use Next.js API routes
  limit = 12,
  onNFTClick = () => {},
  className = ''
}) => {
  const { setNFT, currentAccount } = useContext(NFTMarketplaceContext);
  const [recommendations, setRecommendations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastCalculated, setLastCalculated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState('');

  const fetchRecommendations = async (forceRefresh = false) => {
    if (!currentAccount) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        walletAddress: currentAccount,
        limit: limit.toString(),
        ...(forceRefresh && { forceRefresh: 'true' })
      });
      
      const response = await fetch(`${apiBaseUrl}/get?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setRecommendations(data.recommendations || []);
      setUserProfile(data.userProfile || null);
      setLastCalculated(data.lastCalculated);
      setSource(data.source);
      
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
      setRecommendations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations(true);
  };

  const handleNFTClick = (nftId, nftData) => {
    // Track view interaction
    // if (currentAccount && nftId) {
    //   tracker.trackInteraction(currentAccount, nftId, 'view', {
    //     source: 'recommendations',
    //     recommendation_source: source,
    //     ...nftData
    //   });
    // }
    
    // Set NFT context for navigation
    if (nftData) {
      setNFT(nftData);
    }
    
    // Call parent callback
    onNFTClick(nftId, nftData);
  };

  useEffect(() => {
    fetchRecommendations();
  }, [currentAccount, limit]);

  const getReasonIcon = (reason) => {
    if (reason.includes('Similar')) return <Sparkles className={Style.iconSmall} />;
    if (reason.includes('Trending')) return <TrendingUp className={Style.iconSmall} />;
    if (reason.includes('Popular')) return <Heart className={Style.iconSmall} />;
    return <Eye className={Style.iconSmall} />;
  };

  const getReasonColor = (reason) => {
    if (reason.includes('Similar')) return Style.reasonPurple;
    if (reason.includes('Trending')) return Style.reasonGreen;
    if (reason.includes('Popular')) return Style.reasonPink;
    return Style.reasonBlue;
  };

  const formatScore = (score) => {
    return Math.round(score * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  const getSourceBadge = () => {
    switch (source) {
      case 'cached':
        return { text: 'Cached', color: Style.sourceCached };
      case 'fresh':
        return { text: 'Fresh', color: Style.sourceFresh };
      case 'cached_fallback':
        return { text: 'Cached (Fallback)', color: Style.sourceWarning };
      case 'ml_service':
        return { text: 'AI Generated', color: Style.sourceFresh };
      default:
        return null;
    }
  };

  if (loading && !refreshing) {
    return (
      <div className={`${Style.container} ${className}`}>
        <div className={Style.header}>
          <h2 className={Style.title}>Recommended for You</h2>
        </div>
        <div className={Style.loadingGrid}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={Style.loadingCard}>
              <div className={Style.loadingImage}></div>
              <div className={Style.loadingTextLarge}></div>
              <div className={Style.loadingTextSmall}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${Style.container} ${className}`}>
        <div className={Style.errorContainer}>
          <div className={Style.errorContent}>
            <Eye className={Style.errorIcon} />
            <p className={Style.errorTitle}>Unable to load recommendations</p>
            <p className={Style.errorMessage}>{error}</p>
          </div>
          <button
            onClick={() => fetchRecommendations()}
            className={Style.errorButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className={`${Style.container} ${className}`}>
        <div className={Style.errorContainer}>
          <Eye className={Style.emptyIcon} />
          <p className={Style.emptyTitle}>Connect your wallet</p>
          <p className={Style.emptyMessage}>to see personalized recommendations</p>
        </div>
      </div>
    );
  }

  const sourceBadge = getSourceBadge();

  return (
    <div className={`${Style.container} ${className}`}>
      {/* Header */}
      <div className={Style.headerSection}>
        <div className={Style.headerContent}>
          <div>
            <h2 className={Style.mainTitle}>
              <Sparkles className={Style.titleIcon} />
              Recommended for You
              {sourceBadge && (
                <span className={`${Style.sourceBadge} ${sourceBadge.color}`}>
                  {sourceBadge.text}
                </span>
              )}
            </h2>
            {lastCalculated && (
              <p className={Style.lastUpdated}>
                <Clock className={Style.iconSmall} />
                Updated {formatDate(lastCalculated)}
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`${Style.refreshButton} ${refreshing ? Style.refreshDisabled : ''}`}
          >
            <RefreshCw className={`${Style.iconSmall} ${refreshing ? Style.spinning : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* User Profile Summary */}
        {userProfile && (
          <div className={Style.profileSummary}>
            <h3 className={Style.profileTitle}>Your Preferences</h3>
            <div className={Style.tagsContainer}>
              {userProfile.preferredCategories && userProfile.preferredCategories.map((category, index) => (
                <span key={index} className={Style.categoryTag}>
                  {category}
                </span>
              ))}
              
              {userProfile.preferredTags && userProfile.preferredTags.map((tag, index) => (
                <span key={index} className={Style.categoryTag}>
                  {tag}
                </span>
              ))}
              
              {userProfile.preferredPriceRange && (
                <span className={Style.priceTag}>
                  {userProfile.preferredPriceRange} price range
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Grid */}
      <div className={Style.content}>
        {recommendations.length === 0 ? (
          <div className={Style.emptyState}>
            <Sparkles className={Style.emptyStateIcon} />
            <h3 className={Style.emptyStateTitle}>No recommendations yet</h3>
            <p className={Style.emptyStateMessage}>
              Interact with some NFTs to get personalized recommendations!
            </p>
          </div>
        ) : (
          <div className={Style.recommendationsGrid}>
            {recommendations.map((rec, index) => (
              <RecommendationCard
                key={rec.nftId}
                recommendation={rec}
                onClick={(nftData) => handleNFTClick(rec.nftId, nftData)}
                getReasonIcon={getReasonIcon}
                getReasonColor={getReasonColor}
                formatScore={formatScore}
                nfts_contract={nfts}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RecommendationCard = ({ 
  recommendation, 
  onClick, 
  getReasonIcon, 
  getReasonColor, 
  formatScore,
  nfts_contract
}) => {
  const [nftData, setNftData] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if NFT exists in contract array and fetch data
  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        // First, check if the NFT exists in the contract NFTs array
        const contractNFT = nfts_contract?.find(nft => 
          nft.tokenId === recommendation.nftId || 
          nft.tokenId === recommendation.nftId.toString()
        );

        if (contractNFT) {
          // Use the contract NFT data structure
          setNftData(contractNFT);
        } else {
          // Fallback: try to fetch from API
          try {
            const response = await fetch(`/api/nfts/${recommendation.nftId}`);
            if (response.ok) {
              const data = await response.json();
              setNftData(data);
            } else {
              throw new Error('API fetch failed');
            }
          } catch (apiError) {
            console.error('Error fetching NFT data from API:', apiError);
            // Final fallback to placeholder data
            setNftData({
              tokenId: recommendation.nftId,
              listingId: recommendation.nftId,
              seller: '',
              owner: '',
              price: '0.5',
              listingType: 0,
              startPrice: null,
              buyoutPrice: null,
              highestBid: null,
              highestBidder: '',
              endTime: null,
              isActive: true,
              likesCount: 0,
              userHasLiked: false,
              tokenURI: '',
              tags: [],
              metadata: {
                name: `NFT #${recommendation.nftId}`,
                description: '',
                image: `https://picsum.photos/300/300?random=${recommendation.nftId}`,
                attributes: [],
              },
            });
          }
        }
      } catch (error) {
        console.error('Error in fetchNFTData:', error);
        // Error fallback
        setNftData({
          tokenId: recommendation.nftId,
          listingId: recommendation.nftId,
          seller: '',
          owner: '',
          price: '0.5',
          listingType: 0,
          startPrice: null,
          buyoutPrice: null,
          highestBid: null,
          highestBidder: '',
          endTime: null,
          isActive: true,
          likesCount: 0,
          userHasLiked: false,
          tokenURI: '',
          tags: [],
          metadata: {
            name: `NFT #${recommendation.nftId}`,
            description: '',
            image: `https://picsum.photos/300/300?random=${recommendation.nftId}`,
            attributes: [],
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNFTData();
  }, [recommendation.nftId, nfts_contract]);

  if (loading) {
    return (
      <div className={Style.loadingCard}>
        <div className={Style.loadingImage}></div>
        <div className={Style.loadingTextLarge}></div>
        <div className={Style.loadingTextSmall}></div>
      </div>
    );
  }

  return (
    <Link
      href={{ pathname: "/NFT-details", query: { tokenId: nftData.tokenId } }}
    >
      <div 
        className={Style.recommendationCard}
        onClick={() => onClick(nftData)}
      >
        {/* Image */}
        <div className={Style.cardImageContainer}>
          {!imageError ? (
            <img
              src={nftData.metadata.image}
              alt={nftData.metadata.name}
              className={Style.cardImage}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={Style.imagePlaceholder}>
              <Eye className={Style.placeholderIcon} />
            </div>
          )}
          
          {/* Score Badge */}
          <div className={Style.scoreBadge}>
            {formatScore(recommendation.score)}%
          </div>
        </div>

        {/* Content */}
        <div className={Style.cardContent}>
          <h3 className={Style.cardTitle}>
            {nftData.metadata.name} #{nftData.tokenId}
          </h3>
          
          <div className={Style.cardPriceRow}>
            <span className={Style.cardPrice}>
              {nftData.listingType === 1 
                ? (nftData.startPrice || nftData.price) 
                : nftData.price} ETH
            </span>
            <span className={Style.cardPriceLabel}>
              {nftData.listingType === 1 ? 'Current Bid' : 'Price'}
            </span>
          </div>

          {/* Like count display similar to NFTCard */}
          {nftData.likesCount !== undefined && (
            <div className={Style.cardLikes}>
              <Heart className={Style.iconSmall} />
              <span>{nftData.likesCount}</span>
            </div>
          )}

          {/* Recommendation Reason */}
          <div className={`${Style.reasonBadge} ${getReasonColor(recommendation.reason)}`}>
            {getReasonIcon(recommendation.reason)}
            <span className={Style.reasonText}>{recommendation.reason}</span>
          </div>

          {/* Confidence Bar */}
          {recommendation.confidence && (
            <div className={Style.confidenceContainer}>
              <div className={Style.confidenceHeader}>
                <span>Confidence</span>
                <span>{Math.round(recommendation.confidence * 100)}%</span>
              </div>
              <div className={Style.confidenceBarBackground}>
                <div 
                  className={Style.confidenceBar}
                  style={{ width: `${recommendation.confidence * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Auction time remaining (similar to NFTCard) */}
          {nftData.listingType === 1 && nftData.endTime && (
            <div className={Style.auctionTimer}>
              <Clock className={Style.iconSmall} />
              <span>Auction ends: {new Date(nftData.endTime).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NFTRecommendations;