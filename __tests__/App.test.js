import { isValidEmail, generateUniqueId, validateStreamData } from '../src/utils/helpers';

describe('Utility Functions', () => {
  test('isValidEmail should validate email addresses correctly', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  test('generateUniqueId should create unique identifiers', () => {
    const id1 = generateUniqueId('test_');
    const id2 = generateUniqueId('test_');
    
    expect(id1).toMatch(/^test_\d+_[a-z0-9]+$/);
    expect(id2).toMatch(/^test_\d+_[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  test('validateStreamData should validate stream data correctly', () => {
    const validData = {
      title: 'Test Stream',
      description: 'Test Description',
      scheduledStartTime: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    };

    const result = validateStreamData(validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);

    const invalidData = {
      title: '',
      description: '',
      scheduledStartTime: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    };

    const invalidResult = validateStreamData(invalidData);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });
});

describe('Authentication Service', () => {
  test('should be able to import AuthService', () => {
    const AuthService = require('../src/services/AuthService').default;
    expect(AuthService).toBeDefined();
    expect(typeof AuthService.getInstance).toBe('function');
  });
});

describe('YouTube Service', () => {
  test('should be able to import YouTubeService', () => {
    const YouTubeService = require('../src/services/YouTubeService').default;
    expect(YouTubeService).toBeDefined();
    expect(typeof YouTubeService.getInstance).toBe('function');
  });
});

describe('Session Service', () => {
  test('should be able to import SessionService', () => {
    const SessionService = require('../src/services/SessionService').default;
    expect(SessionService).toBeDefined();
    expect(typeof SessionService.getInstance).toBe('function');
  });
});