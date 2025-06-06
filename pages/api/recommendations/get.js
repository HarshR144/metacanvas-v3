// pages/api/recommendations/get.js
// Streamlined API that checks DB first, then calls ML service if needed
import { connectDb } from '../../../lib/mongodb';
import Recommendation from '../../../lib/models/recommendation';
import User from '../../../lib/models/user';

const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://127.0.0.1:5000';

export default async function handler(req, res) {
  await connectDb();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, limit = 10, forceRefresh = false } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Find user
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If force refresh is requested, call ML service directly
    if (forceRefresh === 'true') {
      return await callRecommendationService(walletAddress, limit, res, 'refresh');
    }

    // Check if we have cached recommendations that are still valid
    const recommendation = await Recommendation.findOne({ userId: user._id });
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    if (recommendation && 
        recommendation.lastCalculated > sixHoursAgo && 
        recommendation.recommendations.length > 0) {
      
      // Return cached recommendations
      const topRecommendations = recommendation.recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, parseInt(limit));

      return res.status(200).json({
        recommendations: topRecommendations,
        userProfile: recommendation.userProfile,
        lastCalculated: recommendation.lastCalculated,
        source: 'cached'
      });
    }

    // No valid cached recommendations, call ML service
    return await callRecommendationService(walletAddress, limit, res, 'generate');

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function callRecommendationService(walletAddress, limit, res, action) {
  try {
    const endpoint = action === 'refresh' 
      ? `/recommendations/refresh/${walletAddress}`
      : `/recommendations/by-wallet/${walletAddress}`;
    
    const method = action === 'refresh' ? 'POST' : 'GET';
    
    const response = await fetch(
      `${RECOMMENDATION_SERVICE_URL}${endpoint}?limit=${limit}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        recommendations: data.recommendations || [],
        userProfile: data.userProfile || {},
        lastCalculated: data.lastCalculated,
        source: data.source || 'ml_service'
      });
    }

    throw new Error(`ML service returned ${response.status}`);

  } catch (error) {
    console.error('ML service error:', error);
    
    // Fallback: try to get any existing recommendations from DB
    try {
      await connectDb();
      const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (user) {
        const recommendation = await Recommendation.findOne({ userId: user._id });
        if (recommendation && recommendation.recommendations.length > 0) {
          const topRecommendations = recommendation.recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, parseInt(limit));

          return res.status(200).json({
            recommendations: topRecommendations,
            userProfile: recommendation.userProfile || {},
            lastCalculated: recommendation.lastCalculated,
            source: 'cached_fallback',
            message: 'Using cached recommendations. Fresh recommendations will be available soon.'
          });
        }
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
    }
    
    return res.status(200).json({ 
      recommendations: [],
      userProfile: {},
      message: 'Recommendations are being generated. Please try again in a few minutes.',
      source: 'empty'
    });
  }
}