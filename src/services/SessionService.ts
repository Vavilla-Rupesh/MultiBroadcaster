import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LiveStream } from '../types/navigation';
import { APP_CONFIG } from '../config/credentials';

interface UserSession {
  user: User;
  loginTime: number;
  lastActivity: number;
  activeStreams: LiveStream[];
}

class SessionService {
  private static instance: SessionService;
  private activeSessions: Map<string, UserSession> = new Map();

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  // Create a new user session
  async createSession(user: User): Promise<void> {
    const sessionData: UserSession = {
      user,
      loginTime: Date.now(),
      lastActivity: Date.now(),
      activeStreams: []
    };

    this.activeSessions.set(user.id, sessionData);
    await this.persistSessions();
  }

  // Update last activity for a user
  async updateActivity(userId: string): Promise<void> {
    const session = this.activeSessions.get(userId);
    if (session) {
      session.lastActivity = Date.now();
      await this.persistSessions();
    }
  }

  // Add a stream to user's active streams
  async addActiveStream(userId: string, stream: LiveStream): Promise<void> {
    const session = this.activeSessions.get(userId);
    if (session) {
      // Check if user already has maximum concurrent streams
      if (session.activeStreams.length >= APP_CONFIG.maxConcurrentStreams) {
        throw new Error(`Maximum ${APP_CONFIG.maxConcurrentStreams} concurrent streams allowed`);
      }

      session.activeStreams.push(stream);
      session.lastActivity = Date.now();
      await this.persistSessions();
    }
  }

  // Remove a stream from user's active streams
  async removeActiveStream(userId: string, streamId: string): Promise<void> {
    const session = this.activeSessions.get(userId);
    if (session) {
      session.activeStreams = session.activeStreams.filter(
        stream => stream.id !== streamId
      );
      session.lastActivity = Date.now();
      await this.persistSessions();
    }
  }

  // Get all active streams for a user
  getActiveStreams(userId: string): LiveStream[] {
    const session = this.activeSessions.get(userId);
    return session ? session.activeStreams : [];
  }

  // Get all active sessions
  getActiveSessions(): UserSession[] {
    return Array.from(this.activeSessions.values());
  }

  // Check if a user has an active session
  hasActiveSession(userId: string): boolean {
    return this.activeSessions.has(userId);
  }

  // Remove expired sessions
  async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [userId, session] of this.activeSessions.entries()) {
      const timeSinceLastActivity = now - session.lastActivity;
      if (timeSinceLastActivity > APP_CONFIG.sessionTimeout) {
        expiredSessions.push(userId);
      }
    }

    // Remove expired sessions
    for (const userId of expiredSessions) {
      this.activeSessions.delete(userId);
      console.log(`Removed expired session for user: ${userId}`);
    }

    if (expiredSessions.length > 0) {
      await this.persistSessions();
    }
  }

  // End a user session
  async endSession(userId: string): Promise<void> {
    this.activeSessions.delete(userId);
    await this.persistSessions();
  }

  // Get statistics about active sessions and streams
  getSessionStats(): {
    totalActiveSessions: number;
    totalActiveStreams: number;
    streamsPerChannel: { [key: string]: number };
  } {
    const sessions = this.getActiveSessions();
    const totalActiveSessions = sessions.length;
    let totalActiveStreams = 0;
    const streamsPerChannel: { [key: string]: number } = {};

    sessions.forEach(session => {
      totalActiveStreams += session.activeStreams.length;
      
      // Group streams by user email (simulating channel grouping)
      const userEmail = session.user.email;
      if (!streamsPerChannel[userEmail]) {
        streamsPerChannel[userEmail] = 0;
      }
      streamsPerChannel[userEmail] += session.activeStreams.length;
    });

    return {
      totalActiveSessions,
      totalActiveStreams,
      streamsPerChannel
    };
  }

  // Check for conflicts when multiple users use the same YouTube channel
  checkChannelConflicts(): { [key: string]: User[] } {
    const channelUsers: { [key: string]: User[] } = {};
    
    for (const session of this.activeSessions.values()) {
      const channelId = session.user.youtubeTokens?.scope || session.user.email;
      
      if (!channelUsers[channelId]) {
        channelUsers[channelId] = [];
      }
      channelUsers[channelId].push(session.user);
    }

    // Return only channels with multiple users
    const conflicts: { [key: string]: User[] } = {};
    for (const [channelId, users] of Object.entries(channelUsers)) {
      if (users.length > 1) {
        conflicts[channelId] = users;
      }
    }

    return conflicts;
  }

  // Persist sessions to AsyncStorage
  private async persistSessions(): Promise<void> {
    try {
      const sessionsData = JSON.stringify(Array.from(this.activeSessions.entries()));
      await AsyncStorage.setItem('activeSessions', sessionsData);
    } catch (error) {
      console.error('Error persisting sessions:', error);
    }
  }

  // Load sessions from AsyncStorage
  async loadSessions(): Promise<void> {
    try {
      const sessionsData = await AsyncStorage.getItem('activeSessions');
      if (sessionsData) {
        const sessions = JSON.parse(sessionsData);
        this.activeSessions = new Map(sessions);
        
        // Clean up expired sessions on load
        await this.cleanupExpiredSessions();
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }

  // Initialize the session service
  async initialize(): Promise<void> {
    await this.loadSessions();
    
    // Set up periodic cleanup of expired sessions
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60000); // Check every minute
  }
}

export default SessionService;