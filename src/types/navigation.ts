export type RootStackParamList = {
  Login: undefined;
  YouTubeAuth: undefined;
  Dashboard: undefined;
  ScheduleStream: undefined;
};

export interface User {
  id: string;
  email: string;
  name: string;
  isAuthenticated: boolean;
  youtubeTokens?: YouTubeTokens;
}

export interface YouTubeTokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  scope: string;
}

export interface LiveStream {
  id: string;
  title: string;
  description: string;
  scheduledStartTime: string;
  privacy: 'public' | 'unlisted' | 'private';
  userId: string;
  youtubeStreamId?: string;
  status: 'scheduled' | 'live' | 'ended';
}

export interface AppCredentials {
  email: string;
  password: string;
  name: string;
}