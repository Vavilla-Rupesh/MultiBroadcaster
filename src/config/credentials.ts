import { AppCredentials } from '../types/navigation';

// Hardcoded user credentials for primary authentication
export const APP_CREDENTIALS: AppCredentials[] = [
  {
    email: 'user1@multibroadcaster.com',
    password: 'password123',
    name: 'John Doe'
  },
  {
    email: 'user2@multibroadcaster.com',
    password: 'password456',
    name: 'Jane Smith'
  },
  {
    email: 'broadcaster@example.com',
    password: 'broadcast789',
    name: 'Pro Broadcaster'
  },
  {
    email: 'admin@multibroadcaster.com',
    password: 'admin2023',
    name: 'Admin User'
  }
];

// YouTube OAuth configuration
export const YOUTUBE_CONFIG = {
  clientId: 'YOUR_YOUTUBE_CLIENT_ID.apps.googleusercontent.com',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'multibroadcaster://auth',
  scopes: [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl'
  ],
  responseType: 'code',
  accessType: 'offline'
};

// YouTube API endpoints
export const YOUTUBE_API = {
  baseUrl: 'https://www.googleapis.com/youtube/v3',
  liveStreamsUrl: 'https://www.googleapis.com/youtube/v3/liveStreams',
  liveBroadcastsUrl: 'https://www.googleapis.com/youtube/v3/liveBroadcasts',
  tokenUrl: 'https://oauth2.googleapis.com/token'
};

// App configuration
export const APP_CONFIG = {
  sessionTimeout: 3600000, // 1 hour in milliseconds
  maxConcurrentStreams: 5,
  refreshTokenBuffer: 300000 // 5 minutes in milliseconds
};