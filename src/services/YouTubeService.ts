import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { YOUTUBE_CONFIG, YOUTUBE_API } from '../config/credentials';
import { LiveStream, YouTubeTokens } from '../types/navigation';

class YouTubeService {
  private static instance: YouTubeService;

  public static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService();
    }
    return YouTubeService.instance;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(authCode: string): Promise<YouTubeTokens> {
    try {
      const response = await axios.post(YOUTUBE_API.tokenUrl, {
        code: authCode,
        client_id: YOUTUBE_CONFIG.clientId,
        client_secret: YOUTUBE_CONFIG.clientSecret,
        redirect_uri: YOUTUBE_CONFIG.redirectUri,
        grant_type: 'authorization_code'
      });

      const tokens: YouTubeTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiryDate: Date.now() + (response.data.expires_in * 1000),
        scope: response.data.scope
      };

      // Store tokens
      await AsyncStorage.setItem('youtubeTokens', JSON.stringify(tokens));
      
      return tokens;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<YouTubeTokens> {
    try {
      const response = await axios.post(YOUTUBE_API.tokenUrl, {
        refresh_token: refreshToken,
        client_id: YOUTUBE_CONFIG.clientId,
        client_secret: YOUTUBE_CONFIG.clientSecret,
        grant_type: 'refresh_token'
      });

      const tokens: YouTubeTokens = {
        accessToken: response.data.access_token,
        refreshToken: refreshToken, // Keep existing refresh token
        expiryDate: Date.now() + (response.data.expires_in * 1000),
        scope: response.data.scope
      };

      await AsyncStorage.setItem('youtubeTokens', JSON.stringify(tokens));
      
      return tokens;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken(): Promise<string> {
    try {
      const tokensData = await AsyncStorage.getItem('youtubeTokens');
      if (!tokensData) {
        throw new Error('No YouTube tokens found');
      }

      const tokens: YouTubeTokens = JSON.parse(tokensData);
      
      // Check if token needs refresh (5 minutes buffer)
      if (tokens.expiryDate - Date.now() < 300000) {
        const refreshedTokens = await this.refreshAccessToken(tokens.refreshToken);
        return refreshedTokens.accessToken;
      }

      return tokens.accessToken;
    } catch (error) {
      console.error('Error getting valid access token:', error);
      throw error;
    }
  }

  // Create a live broadcast
  async createLiveBroadcast(streamData: Partial<LiveStream>): Promise<any> {
    try {
      const accessToken = await this.getValidAccessToken();
      
      const broadcastData = {
        snippet: {
          title: streamData.title,
          description: streamData.description,
          scheduledStartTime: streamData.scheduledStartTime
        },
        status: {
          privacyStatus: streamData.privacy || 'public'
        }
      };

      const response = await axios.post(
        `${YOUTUBE_API.liveBroadcastsUrl}?part=snippet,status`,
        broadcastData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating live broadcast:', error);
      throw new Error('Failed to create live broadcast');
    }
  }

  // Create a live stream
  async createLiveStream(title: string): Promise<any> {
    try {
      const accessToken = await this.getValidAccessToken();
      
      const streamData = {
        snippet: {
          title: `${title} - Stream`
        },
        cdn: {
          format: '1080p',
          ingestionType: 'rtmp'
        }
      };

      const response = await axios.post(
        `${YOUTUBE_API.liveStreamsUrl}?part=snippet,cdn`,
        streamData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating live stream:', error);
      throw new Error('Failed to create live stream');
    }
  }

  // Bind stream to broadcast
  async bindStreamToBroadcast(broadcastId: string, streamId: string): Promise<any> {
    try {
      const accessToken = await this.getValidAccessToken();
      
      const response = await axios.post(
        `${YOUTUBE_API.liveBroadcastsUrl}/bind?part=id&id=${broadcastId}&streamId=${streamId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error binding stream to broadcast:', error);
      throw new Error('Failed to bind stream to broadcast');
    }
  }

  // Get user's live broadcasts
  async getLiveBroadcasts(): Promise<any[]> {
    try {
      const accessToken = await this.getValidAccessToken();
      
      const response = await axios.get(
        `${YOUTUBE_API.liveBroadcastsUrl}?part=snippet,status&mine=true`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data.items || [];
    } catch (error) {
      console.error('Error getting live broadcasts:', error);
      return [];
    }
  }

  // Generate YouTube OAuth URL
  generateOAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: YOUTUBE_CONFIG.clientId,
      redirect_uri: YOUTUBE_CONFIG.redirectUri,
      response_type: YOUTUBE_CONFIG.responseType,
      scope: YOUTUBE_CONFIG.scopes.join(' '),
      access_type: YOUTUBE_CONFIG.accessType,
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
  }
}

export default YouTubeService;