# MultiBroadcaster

A multi-user YouTube live streaming scheduler mobile application with dual authentication system.

## Features

### 🔐 Dual Authentication System
- **Primary Authentication**: Email/password authentication using hardcoded credentials stored in app configuration
- **YouTube OAuth 2.0**: Secure integration with YouTube Data API for live streaming access
- Support for multiple concurrent user sessions

### 📺 YouTube Live Stream Management
- Schedule live streams directly to YouTube channels
- Configure stream settings:
  - Title and description
  - Scheduled start time and date
  - Privacy settings (public/unlisted/private)
- Real-time stream status tracking

### 👥 Multi-User Support
- Multiple users can login simultaneously
- Each user can manage their own live streams
- Same YouTube channel can support multiple concurrent streams
- Session management with automatic cleanup
- Conflict resolution for shared channels

### 📱 Mobile-First Design
- Built with React Native and Expo
- Material Design UI components
- Responsive layout for various screen sizes
- Cross-platform compatibility (iOS/Android)

## Technical Stack

- **Framework**: React Native with Expo
- **UI Library**: React Native Paper (Material Design)
- **Navigation**: React Navigation v6
- **State Management**: React hooks and AsyncStorage
- **Authentication**: Expo AuthSession for OAuth
- **APIs**: YouTube Data API v3 and Live Streaming API
- **Language**: TypeScript

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Main application screens
│   ├── LoginScreen.tsx
│   ├── YouTubeAuthScreen.tsx
│   ├── DashboardScreen.tsx
│   └── ScheduleStreamScreen.tsx
├── services/           # Business logic and API services
│   ├── AuthService.ts
│   ├── YouTubeService.ts
│   └── SessionService.ts
├── config/             # Configuration and credentials
│   └── credentials.ts
├── types/              # TypeScript type definitions
│   └── navigation.ts
└── utils/              # Utility functions
    └── helpers.ts
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Vavilla-Rupesh/MultiBroadcaster.git
cd MultiBroadcaster
```

2. Install dependencies:
```bash
npm install
```

3. Configure YouTube OAuth credentials:
   - Edit `src/config/credentials.ts`
   - Add your YouTube API client ID and secret
   - Update redirect URI for your app

4. Start the development server:
```bash
npm start
```

5. Use Expo Go app or simulator to test the application

### Demo Credentials

The app includes demo credentials for testing:

- **User 1**: user1@multibroadcaster.com / password123
- **User 2**: user2@multibroadcaster.com / password456
- **Broadcaster**: broadcaster@example.com / broadcast789
- **Admin**: admin@multibroadcaster.com / admin2023

## Configuration

### YouTube API Setup

1. Create a project in Google Cloud Console
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Update `src/config/credentials.ts` with your credentials

### App Settings

Configure app behavior in `src/config/credentials.ts`:

```typescript
export const APP_CONFIG = {
  sessionTimeout: 3600000,     // 1 hour
  maxConcurrentStreams: 5,     // Per user
  refreshTokenBuffer: 300000   // 5 minutes
};
```

## Usage

### Authentication Flow

1. **Primary Login**: Enter email and password using hardcoded credentials
2. **YouTube OAuth**: Complete OAuth flow to access YouTube API
3. **Dashboard**: View active streams and manage account

### Scheduling Streams

1. Navigate to "Schedule Stream" from dashboard
2. Fill in stream details:
   - Title and description
   - Date and time selection
   - Privacy settings
3. Confirm to create YouTube live broadcast

### Multi-User Sessions

- Multiple users can login simultaneously
- Each user maintains independent stream management
- Session statistics available on dashboard
- Automatic cleanup of expired sessions

## API Integration

### YouTube Live Streaming API

The app integrates with YouTube's Live Streaming API to:
- Create live broadcasts
- Manage stream settings
- Monitor stream status
- Handle multiple concurrent streams per channel

### Security Features

- Secure token storage using AsyncStorage
- Automatic token refresh
- Session timeout management
- Input validation and sanitization

## Development

### Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser
npm test          # Run tests
npm run lint      # Run ESLint
```

### Building for Production

```bash
expo build:android  # Build Android APK
expo build:ios      # Build iOS IPA
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Open an issue on GitHub
- Contact the development team

---

**Note**: This is a demonstration application. For production use, ensure proper security measures, obtain necessary API quotas, and implement comprehensive error handling.