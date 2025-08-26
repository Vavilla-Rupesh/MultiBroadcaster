import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import {
  Button,
  Text,
  Card,
  Title,
  Paragraph,
  Chip,
  Divider,
  FAB
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, User, LiveStream } from '../types/navigation';
import AuthService from '../services/AuthService';
import SessionService from '../services/SessionService';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeStreams, setActiveStreams] = useState<LiveStream[]>([]);
  const [sessionStats, setSessionStats] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);

  const authService = AuthService.getInstance();
  const sessionService = SessionService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigation.replace('Login');
        return;
      }

      setUser(currentUser);
      
      // Update user activity
      await sessionService.updateActivity(currentUser.id);
      
      // Load active streams for current user
      const streams = sessionService.getActiveStreams(currentUser.id);
      setActiveStreams(streams);
      
      // Load session statistics
      const stats = sessionService.getSessionStats();
      setSessionStats(stats);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleScheduleStream = () => {
    if (!authService.isYouTubeAuthenticated()) {
      Alert.alert(
        'YouTube Authentication Required',
        'You need to authenticate with YouTube to schedule live streams.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Authenticate',
            onPress: () => navigation.navigate('YouTubeAuth')
          }
        ]
      );
      return;
    }

    navigation.navigate('ScheduleStream');
  };

  const handleEndStream = async (streamId: string) => {
    Alert.alert(
      'End Stream',
      'Are you sure you want to end this live stream?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'End Stream',
          onPress: async () => {
            try {
              if (user) {
                await sessionService.removeActiveStream(user.id, streamId);
                await loadDashboardData();
                Alert.alert('Success', 'Live stream ended successfully');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
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
            try {
              if (user) {
                await sessionService.endSession(user.id);
              }
              await authService.logout();
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return '#4caf50';
      case 'scheduled': return '#ff9800';
      case 'ended': return '#9e9e9e';
      default: return '#2196f3';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* User Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>{user.name}</Title>
            <Paragraph>{user.email}</Paragraph>
            <View style={styles.authStatus}>
              <Chip
                icon={user.isAuthenticated ? 'check' : 'close'}
                mode="outlined"
                style={[
                  styles.statusChip,
                  { backgroundColor: user.isAuthenticated ? '#e8f5e8' : '#ffebee' }
                ]}
              >
                App Authentication
              </Chip>
              <Chip
                icon={authService.isYouTubeAuthenticated() ? 'youtube' : 'close'}
                mode="outlined"
                style={[
                  styles.statusChip,
                  { backgroundColor: authService.isYouTubeAuthenticated() ? '#e8f5e8' : '#ffebee' }
                ]}
              >
                YouTube Authentication
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Active Streams Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Your Active Streams ({activeStreams.length})</Title>
            {activeStreams.length === 0 ? (
              <Paragraph>No active streams. Schedule a new live stream to get started.</Paragraph>
            ) : (
              activeStreams.map((stream) => (
                <View key={stream.id} style={styles.streamItem}>
                  <View style={styles.streamHeader}>
                    <Text style={styles.streamTitle}>{stream.title}</Text>
                    <Chip
                      icon="circle"
                      style={[
                        styles.streamStatus,
                        { backgroundColor: getStatusColor(stream.status) }
                      ]}
                      textStyle={{ color: 'white' }}
                    >
                      {stream.status.toUpperCase()}
                    </Chip>
                  </View>
                  <Text style={styles.streamDescription}>{stream.description}</Text>
                  <Text style={styles.streamTime}>
                    Scheduled: {formatDateTime(stream.scheduledStartTime)}
                  </Text>
                  <Text style={styles.streamPrivacy}>Privacy: {stream.privacy}</Text>
                  <Button
                    mode="outlined"
                    onPress={() => handleEndStream(stream.id)}
                    style={styles.endStreamButton}
                    compact
                  >
                    End Stream
                  </Button>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Session Statistics Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Platform Statistics</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{sessionStats.totalActiveSessions || 0}</Text>
                <Text style={styles.statLabel}>Active Users</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{sessionStats.totalActiveStreams || 0}</Text>
                <Text style={styles.statLabel}>Total Streams</Text>
              </View>
            </View>
            
            {sessionStats.streamsPerChannel && Object.keys(sessionStats.streamsPerChannel).length > 0 && (
              <>
                <Divider style={styles.divider} />
                <Text style={styles.channelsTitle}>Streams per Channel:</Text>
                {Object.entries(sessionStats.streamsPerChannel).map(([channel, count]) => (
                  <Text key={channel} style={styles.channelItem}>
                    {channel}: {String(count)} stream(s)
                  </Text>
                ))}
              </>
            )}
          </Card.Content>
        </Card>

        {/* Actions Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Actions</Title>
            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                onPress={handleScheduleStream}
                style={styles.actionButton}
                icon="plus"
              >
                Schedule New Stream
              </Button>
              
              {!authService.isYouTubeAuthenticated() && (
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('YouTubeAuth')}
                  style={styles.actionButton}
                  icon="youtube"
                >
                  Complete YouTube Authentication
                </Button>
              )}
              
              <Button
                mode="text"
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                Logout
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleScheduleStream}
        label="Schedule Stream"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  authStatus: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  statusChip: {
    marginRight: 8,
  },
  streamItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  streamStatus: {
    marginLeft: 8,
  },
  streamDescription: {
    color: '#666',
    marginBottom: 4,
  },
  streamTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  streamPrivacy: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  endStreamButton: {
    alignSelf: 'flex-start',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    marginVertical: 12,
  },
  channelsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  channelItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#FF0000',
  },
  logoutButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF0000',
  },
});

export default DashboardScreen;