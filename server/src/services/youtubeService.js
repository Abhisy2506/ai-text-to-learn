import axios from 'axios';
import dotenv from 'dotenv';
import { ApiError } from '../utils/ApiError.js';

dotenv.config();

/**
 * Youtube ID
 * @param {string} query
 * @returns {string|null} 
 */
export const fetchRelatedVideo = async (query) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: `${query} tutorial course`,
        type: 'video',
        maxResults: 1,
        videoEmbeddable: 'true',
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].id.videoId;
    }
    return null;
  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    return null; 
  }
};