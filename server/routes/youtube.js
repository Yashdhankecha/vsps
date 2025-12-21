const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.YOUTUBE_API_KEY;

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID?.replace('https://www.youtube.com/channel/', '');


console.log('YouTube API Configuration:');
console.log('API Key exists:', !!API_KEY);
console.log('Channel ID:', CHANNEL_ID);


if (!API_KEY || !CHANNEL_ID) {
  console.error('YouTube API configuration missing. Please set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID in .env file');
}


router.get('/check-live', async (req, res) => {
  try {
    if (!API_KEY || !CHANNEL_ID) {
      console.error('Missing credentials:', {
        hasApiKey: !!API_KEY,
        hasChannelId: !!CHANNEL_ID
      });
      return res.status(500).json({
        error: 'YouTube API configuration missing',
        details: 'Please set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID in .env file'
      });
    }

    console.log('Making YouTube API request for live status...');
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          part: 'snippet',
          channelId: CHANNEL_ID,
          eventType: 'live',
          type: 'video',
          key: API_KEY,
          maxResults: 1,
          order: 'date'
        },
      }
    );

    console.log('YouTube API response:', {
      status: response.status,
      hasItems: !!response.data.items,
      itemCount: response.data.items?.length
    });

    if (response.data.items && response.data.items.length > 0) {
      const videoId = response.data.items[0].id.videoId;
      const streamInfo = response.data.items[0].snippet;
      res.json({
        live: true,
        videoId,
        title: streamInfo.title,
        description: streamInfo.description,
        thumbnailUrl: streamInfo.thumbnails.high.url,
        publishedAt: streamInfo.publishedAt
      });
    } else {
      res.json({ live: false });
    }
  } catch (err) {
    console.error('YouTube API error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      params: err.config?.params
    });
    res.status(500).json({
      error: 'YouTube API error',
      details: err.response?.data?.error?.message || err.message
    });
  }
});


router.get('/upcoming', async (req, res) => {
  try {
    if (!API_KEY || !CHANNEL_ID) {
      console.error('Missing credentials:', {
        hasApiKey: !!API_KEY,
        hasChannelId: !!CHANNEL_ID
      });
      return res.status(500).json({
        error: 'YouTube API configuration missing',
        details: 'Please set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID in .env file'
      });
    }

    console.log('Making YouTube API request for upcoming streams...');
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          part: 'snippet',
          channelId: CHANNEL_ID,
          eventType: 'upcoming',
          type: 'video',
          key: API_KEY,
          maxResults: 10,
          order: 'date'
        },
      }
    );

    console.log('YouTube API response:', {
      status: response.status,
      hasItems: !!response.data.items,
      itemCount: response.data.items?.length
    });

    if (!response.data.items) {
      return res.json({ upcomingStreams: [] });
    }

    const upcomingStreams = response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      scheduledStartTime: item.snippet.publishedAt
    }));

    res.json({ upcomingStreams });
  } catch (err) {
    console.error('YouTube API error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      params: err.config?.params
    });
    res.status(500).json({
      error: 'YouTube API error',
      details: err.response?.data?.error?.message || err.message
    });
  }
});

module.exports = router; 