import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  RadioButton,
  Chip
} from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, LiveStream } from '../types/navigation';
import AuthService from '../services/AuthService';
import SessionService from '../services/SessionService';
import YouTubeService from '../services/YouTubeService';

type ScheduleStreamScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ScheduleStream'>;

interface Props {
  navigation: ScheduleStreamScreenNavigationProp;
}

const ScheduleStreamScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [loading, setLoading] = useState(false);

  const authService = AuthService.getInstance();
  const sessionService = SessionService.getInstance();
  const youtubeService = YouTubeService.getInstance();

  const handleScheduleStream = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a stream title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a stream description');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date for the stream');
      return;
    }

    setLoading(true);

    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Combine date and time
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}:00.000Z`);
      
      // Check if the scheduled time is in the future
      if (scheduledDateTime <= new Date()) {
        Alert.alert('Error', 'Please select a future date and time');
        setLoading(false);
        return;
      }

      // Create the live stream object
      const streamData: LiveStream = {
        id: generateStreamId(),
        title: title.trim(),
        description: description.trim(),
        scheduledStartTime: scheduledDateTime.toISOString(),
        privacy,
        userId: user.id,
        status: 'scheduled'
      };

      // Check if user has reached maximum concurrent streams
      const activeStreams = sessionService.getActiveStreams(user.id);
      if (activeStreams.length >= 5) {
        Alert.alert('Error', 'Maximum 5 concurrent streams allowed per user');
        setLoading(false);
        return;
      }

      // Add stream to user's active streams
      await sessionService.addActiveStream(user.id, streamData);

      // Simulate YouTube API call for creating broadcast
      // In production, this would call the actual YouTube API
      const mockYouTubeResponse = {
        id: `yt_broadcast_${Date.now()}`,
        snippet: {
          title: streamData.title,
          description: streamData.description,
          scheduledStartTime: streamData.scheduledStartTime
        },
        status: {
          privacyStatus: streamData.privacy
        }
      };

      // Update stream with YouTube broadcast ID
      streamData.youtubeStreamId = mockYouTubeResponse.id;

      Alert.alert(
        'Stream Scheduled Successfully',
        `Your live stream "${title}" has been scheduled for ${scheduledDateTime.toLocaleString()}.`,
        [
          {
            text: 'Schedule Another',
            onPress: () => resetForm()
          },
          {
            text: 'Go to Dashboard',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to schedule stream');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedDate('');
    setSelectedTime('12:00');
    setPrivacy('public');
  };

  const generateStreamId = (): string => {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const today = new Date().toISOString().split('T')[0];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Schedule Live Stream</Title>

            <TextInput
              label="Stream Title"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
              placeholder="Enter an engaging title for your stream"
              maxLength={100}
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              style={styles.input}
              placeholder="Describe what your stream will be about"
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            <Text style={styles.sectionTitle}>Select Date</Text>
            <Calendar
              style={styles.calendar}
              onDayPress={handleDateSelect}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: '#FF0000'
                }
              }}
              minDate={today}
              theme={{
                selectedDayBackgroundColor: '#FF0000',
                todayTextColor: '#FF0000',
                arrowColor: '#FF0000',
              }}
            />

            <Text style={styles.sectionTitle}>Select Time</Text>
            <View style={styles.timeContainer}>
              {timeSlots.map((time) => (
                <Chip
                  key={time}
                  style={[
                    styles.timeChip,
                    selectedTime === time && styles.selectedTimeChip
                  ]}
                  onPress={() => setSelectedTime(time)}
                  mode={selectedTime === time ? 'flat' : 'outlined'}
                >
                  {time}
                </Chip>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Privacy Setting</Text>
            <RadioButton.Group
              onValueChange={(value) => setPrivacy(value as any)}
              value={privacy}
            >
              <View style={styles.radioContainer}>
                <View style={styles.radioItem}>
                  <RadioButton value="public" />
                  <Text style={styles.radioLabel}>Public</Text>
                </View>
                <Text style={styles.radioDescription}>
                  Anyone can search for and view
                </Text>
              </View>

              <View style={styles.radioContainer}>
                <View style={styles.radioItem}>
                  <RadioButton value="unlisted" />
                  <Text style={styles.radioLabel}>Unlisted</Text>
                </View>
                <Text style={styles.radioDescription}>
                  Anyone with the link can view
                </Text>
              </View>

              <View style={styles.radioContainer}>
                <View style={styles.radioItem}>
                  <RadioButton value="private" />
                  <Text style={styles.radioLabel}>Private</Text>
                </View>
                <Text style={styles.radioDescription}>
                  Only you can view
                </Text>
              </View>
            </RadioButton.Group>

            {selectedDate && (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Stream Summary:</Text>
                <Text style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>Title: </Text>{title || 'Not set'}
                </Text>
                <Text style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>Date: </Text>
                  {new Date(`${selectedDate}T${selectedTime}:00`).toLocaleString()}
                </Text>
                <Text style={styles.summaryText}>
                  <Text style={styles.summaryLabel}>Privacy: </Text>{privacy}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleScheduleStream}
                loading={loading}
                disabled={loading || !title || !description || !selectedDate}
                style={styles.scheduleButton}
                icon="calendar-plus"
              >
                Schedule Stream
              </Button>

              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
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
    elevation: 2,
  },
  title: {
    textAlign: 'center',
    color: '#FF0000',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  calendar: {
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  timeChip: {
    marginBottom: 8,
  },
  selectedTimeChip: {
    backgroundColor: '#FF0000',
  },
  radioContainer: {
    marginBottom: 12,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  radioDescription: {
    fontSize: 12,
    color: '#666',
    marginLeft: 40,
    marginTop: 2,
  },
  summaryContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryLabel: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  scheduleButton: {
    backgroundColor: '#FF0000',
  },
  cancelButton: {
    borderColor: '#FF0000',
  },
});

export default ScheduleStreamScreen;