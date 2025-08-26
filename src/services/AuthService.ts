import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CREDENTIALS } from '../config/credentials';
import { User, AppCredentials } from '../types/navigation';

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Primary authentication using hardcoded credentials
  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const credential = APP_CREDENTIALS.find(
        cred => cred.email === email && cred.password === password
      );

      if (!credential) {
        throw new Error('Invalid email or password');
      }

      const user: User = {
        id: this.generateUserId(email),
        email: credential.email,
        name: credential.name,
        isAuthenticated: true
      };

      // Store user session
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUser = user;

      return user;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  // Get current authenticated user
  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      }
    } catch (error) {
      console.error('Error retrieving current user:', error);
    }

    return null;
  }

  // Update user with YouTube tokens
  async updateUserTokens(youtubeTokens: any): Promise<void> {
    if (this.currentUser) {
      this.currentUser.youtubeTokens = youtubeTokens;
      await AsyncStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }

  // Check if user has valid YouTube authentication
  isYouTubeAuthenticated(): boolean {
    return !!(this.currentUser?.youtubeTokens?.accessToken);
  }

  // Logout user
  async logout(): Promise<void> {
    this.currentUser = null;
    await AsyncStorage.removeItem('currentUser');
    await AsyncStorage.removeItem('youtubeTokens');
  }

  // Generate unique user ID
  private generateUserId(email: string): string {
    return btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get all valid credentials (for testing purposes)
  getValidCredentials(): AppCredentials[] {
    return APP_CREDENTIALS;
  }
}

export default AuthService;