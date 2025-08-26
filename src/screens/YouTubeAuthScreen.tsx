import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Linking
} from 'react-native';
import {
  Button,
  Text,
  Card,
  Title,
  Paragraph,
  ActivityIndicator
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { RootStackParamList } from '../types/navigation';
import AuthService from '../services/AuthService';
import YouTubeService from '../services/YouTubeService';

WebBrowser.maybeCompleteAuthSession();

type YouTubeAuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'YouTubeAuth'>;

interface Props {
  navigation: YouTubeAuthScreenNavigationProp;
}

const YouTubeAuthScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const authService = AuthService.getInstance();
  const youtubeService = YouTubeService.getInstance();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      // Check if already authenticated with YouTube
      if (authService.isYouTubeAuthenticated()) {
        navigation.replace('Dashboard');
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleYouTubeAuth = async () => {
    setLoading(true);
    
    try {
      // For demo purposes, we'll simulate the OAuth flow
      // In a real app, you would use the actual YouTube OAuth flow
      const authUrl = youtubeService.generateOAuthUrl();
      
      Alert.alert(
        'YouTube Authentication',
        'In a production app, this would open YouTube OAuth. For demo purposes, we\'ll simulate successful authentication.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setLoading(false)
          },
          {
            text: 'Simulate Success',
            onPress: () => simulateYouTubeAuth()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
      setLoading(false);
    }
  };

  const simulateYouTubeAuth = async () => {
    try {
      // Simulate successful YouTube authentication
      const mockTokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiryDate: Date.now() + 3600000, // 1 hour from now
        scope: 'https://www.googleapis.com/auth/youtube'
      };

      await authService.updateUserTokens(mockTokens);

      Alert.alert(
        'Authentication Successful',
        'YouTube authentication completed! You can now schedule live streams.',
        [
          {
            text: 'Continue to Dashboard',
            onPress: () => navigation.replace('Dashboard')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            await authService.logout();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const handleSkipAuth = () => {
    Alert.alert(
      'Skip YouTube Authentication',
      'Without YouTube authentication, you won\'t be able to create live streams. You can authenticate later from the dashboard.',
      [
        {
          text: 'Go Back',
          style: 'cancel'
        },
        {
          text: 'Continue Anyway',
          onPress: () => navigation.replace('Dashboard')
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>YouTube Authentication</Title>
          
          {user && (
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome, {user.name}!</Text>
              <Text style={styles.emailText}>{user.email}</Text>
            </View>
          )}

          <Paragraph style={styles.description}>
            To schedule and manage live streams, you need to authenticate with YouTube.
            This allows the app to access your YouTube channel and create live broadcasts.
          </Paragraph>

          <View style={styles.permissionsContainer}>
            <Text style={styles.permissionsTitle}>Required Permissions:</Text>
            <Text style={styles.permissionItem}>• Access to YouTube account</Text>
            <Text style={styles.permissionItem}>• Create and manage live broadcasts</Text>
            <Text style={styles.permissionItem}>• View channel information</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF0000" />
              <Text style={styles.loadingText}>Authenticating with YouTube...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleYouTubeAuth}
                style={styles.authButton}
                icon="youtube"
              >
                Authenticate with YouTube
              </Button>

              <Button
                mode="outlined"
                onPress={handleSkipAuth}
                style={styles.skipButton}
              >
                Skip for Now
              </Button>

              <Button
                mode="text"
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                Logout
              </Button>
            </View>
          )}

          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              Note: In production, this would redirect to Google's OAuth consent screen.
              For demo purposes, we simulate the authentication process.
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    color: '#FF0000',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userInfo: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emailText: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  permissionsContainer: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  permissionsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#e65100',
  },
  permissionItem: {
    color: '#ef6c00',
    marginBottom: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  buttonContainer: {
    gap: 12,
  },
  authButton: {
    backgroundColor: '#FF0000',
  },
  skipButton: {
    borderColor: '#FF0000',
  },
  logoutButton: {
    marginTop: 8,
  },
  noteContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#2e7d32',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default YouTubeAuthScreen;