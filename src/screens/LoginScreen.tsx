import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  Paragraph,
  Chip
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import AuthService from '../services/AuthService';
import SessionService from '../services/SessionService';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const authService = AuthService.getInstance();
  const sessionService = SessionService.getInstance();

  useEffect(() => {
    // Initialize session service
    sessionService.initialize();
    
    // Check if user is already logged in
    checkExistingLogin();
  }, []);

  const checkExistingLogin = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user && user.isAuthenticated) {
        if (authService.isYouTubeAuthenticated()) {
          navigation.replace('Dashboard');
        } else {
          navigation.replace('YouTubeAuth');
        }
      }
    } catch (error) {
      console.error('Error checking existing login:', error);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!authService.validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const user = await authService.authenticateUser(email.trim(), password);
      
      if (user) {
        // Create session for the user
        await sessionService.createSession(user);
        
        Alert.alert(
          'Login Successful',
          `Welcome, ${user.name}! Please complete YouTube authentication.`,
          [
            {
              text: 'Continue',
              onPress: () => navigation.replace('YouTubeAuth')
            }
          ]
        );
      } else {
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCredential = (credential: any) => {
    setEmail(credential.email);
    setPassword(credential.password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>MultiBroadcaster</Title>
              <Paragraph style={styles.subtitle}>
                Multi-user YouTube Live Streaming Platform
              </Paragraph>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry
                autoComplete="password"
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
              >
                Login
              </Button>

              <Button
                mode="text"
                onPress={() => setShowCredentials(!showCredentials)}
                style={styles.demoButton}
              >
                {showCredentials ? 'Hide' : 'Show'} Demo Credentials
              </Button>

              {showCredentials && (
                <View style={styles.credentialsContainer}>
                  <Text style={styles.credentialsTitle}>Demo Accounts:</Text>
                  {authService.getValidCredentials().map((credential, index) => (
                    <Chip
                      key={index}
                      style={styles.credentialChip}
                      onPress={() => handleDemoCredential(credential)}
                    >
                      {credential.name} ({credential.email})
                    </Chip>
                  ))}
                </View>
              )}

              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  After logging in, you'll need to authenticate with YouTube to access live streaming features.
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    color: '#FF0000',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 16,
    backgroundColor: '#FF0000',
  },
  demoButton: {
    marginTop: 8,
  },
  credentialsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  credentialsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  credentialChip: {
    marginBottom: 8,
    marginRight: 8,
  },
  infoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1976d2',
    textAlign: 'center',
  },
});

export default LoginScreen;