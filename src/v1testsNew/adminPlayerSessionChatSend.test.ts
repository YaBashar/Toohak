import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions for requests
const registerUser = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: { email, password, nameFirst, nameLast },
      timeout: TIMEOUT_MS,
    }
  );
  return JSON.parse(res.body.toString());
};

const requestCreateSession = (token: string, quizid: number, autoStartNum: number) => {
  return request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/session/start`, {
    headers: { token },
    json: { autoStartNum: autoStartNum },
    timeout: TIMEOUT_MS
  });
};

const requestCreateQuiz = (token: string, name: string, description: string) => {
  const quiz = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description },
    timeout: TIMEOUT_MS
  });
  return JSON.parse(quiz.body.toString()).quizId;
};

const createQuizQuestion = (token: string, quizid: number, question: string, duration: number, points: number, thumbnailUrl: string, answers: object) => {
  return request('POST', SERVER_URL + `/v2/admin/quiz/${quizid}/question`, {
    headers: { token },
    json: {
      questionBody: { question, duration, points, thumbnailUrl, answers }
    }
  });
};

const requestPlayerJoin = (sessionId: number, name: string) => {
  return request('POST', SERVER_URL + '/v1/player/join', {
    json: { sessionId, name },
    timeout: TIMEOUT_MS
  });
};

const sendMessage = (playerId: number, messageBody: string) => {
  return request(
    'POST',
    SERVER_URL + `/v1/player/${playerId}/chat`,
    {
      json: { message: messageBody },
      timeout: TIMEOUT_MS,
    }
  );
};

const getPlayerChatMessages = (playerId: number) => {
  return request(
    'GET',
    SERVER_URL + `/v1/player/${playerId}/chat`,
    {
      timeout: TIMEOUT_MS
    }
  );
};

// Helper Function to check timestamp range
const checkTimestampRange = (timestamp: number, expected: number, tolerance: number) => {
  const lowerBound = expected - tolerance;
  const upperBound = expected + tolerance;
  return timestamp >= lowerBound && timestamp <= upperBound;
};

// Test Cases
beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Player Chat Retrieval Tests', () => {
  let token: string;
  let playerId1: number;
  let playerId2: number;
  let sessionId: number;
  let quizId: number;

  beforeEach(() => {
    const user = registerUser('user@unsw.edu.au', '123ABCabc@#$', 'Test', 'User');
    token = user.token;

    quizId = requestCreateQuiz(token, 'quizName', 'description');
    createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, 'https://example.com/image-thumbnail-12345.jpg', [
      { answer: 'Prince Charles', correct: true },
      { answer: 'Queen Elizabeth', correct: false }
    ]);

    const session = requestCreateSession(token, quizId, 3);
    sessionId = JSON.parse(session.body.toString()).sessionId;

    const player1 = requestPlayerJoin(sessionId, 'Mubashir');
    const player2 = requestPlayerJoin(sessionId, 'Mohammad');

    playerId1 = JSON.parse(player1.body.toString()).playerId;
    playerId2 = JSON.parse(player2.body.toString()).playerId;

    // Send test messages
    sendMessage(playerId1, 'Hello, this is a test message.');
    sendMessage(playerId2, 'Another test message.');
  });

  describe('Error Cases', () => {
    test('Handle case where player ID does not exist', () => {
      const invalidPlayerId = playerId1 + 999;
      const res = getPlayerChatMessages(invalidPlayerId);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Player ID does not exist' });
    });

    test('Handle case where player ID format is invalid', () => {
      const invalidPlayerId = 'invalid' as any;
      const res = getPlayerChatMessages(Number(invalidPlayerId));
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Invalid player ID format' });
    });
  });

  describe('Success Cases', () => {
    test('Retrieve chat messages for a valid player ID', () => {
      const res = getPlayerChatMessages(playerId1);
      expect(res.statusCode).toBe(200);

      const messages = JSON.parse(res.body.toString()).messages;
      expect(Array.isArray(messages)).toBe(true);

      if (messages.length > 0) {
        const currentTime = Math.floor(Date.now() / 1000);
        
        expect(checkTimestampRange(messages[0].timeSent, currentTime, 1)).toBe(true);
        expect(checkTimestampRange(messages[1].timeSent, currentTime, 1)).toBe(true);
        expect(messages[0].content).toBe('Hello, this is a test message.');
        expect(messages[1].content).toBe('Another test message.');
      }
    });

    test('Retrieve chat messages for a player with multiple messages', () => {
      const res = getPlayerChatMessages(playerId2);
      expect(res.statusCode).toBe(200);

      const messages = JSON.parse(res.body.toString()).messages;
      expect(Array.isArray(messages)).toBe(true);

      if (messages.length > 0) {
        const currentTime = Math.floor(Date.now() / 1000);
        expect(checkTimestampRange(messages[0].timeSent, currentTime, 1)).toBe(true);
        expect(messages[0].content).toBe('Another test message.');
      }
    });
  });
});
