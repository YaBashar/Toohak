import request from 'sync-request-curl';
import { port, url } from '../config.json';
import slync from 'slync';

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

const getMessages = (playerId: number) => {
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
  describe('Error Cases', () => {
    let token: string;
    let playerId1: number;
    let sessionId: number;
    let quizId: number;

    beforeEach(() => {
      const user = registerUser('user@unsw.edu.au', '123ABCabc@#$', 'Test', 'User');
      token = user.token;

      quizId = requestCreateQuiz(token, 'Test Quiz', 'Test Description');
      createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, 'https://example.com/image-thumbnail-12345.jpg', [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Queen Elizabeth', correct: false }
      ]);

      const session = requestCreateSession(token, quizId, 3);
      sessionId = JSON.parse(session.body.toString()).sessionId;

      const player1 = requestPlayerJoin(sessionId, 'Mubashir');
      requestPlayerJoin(sessionId, 'Mohammad');
      requestPlayerJoin(sessionId, 'Syed');

      playerId1 = JSON.parse(player1.body.toString()).playerId;
    });

    test('Player ID does not exist', () => {
      const res = request('GET', SERVER_URL + `/v1/player/${playerId1 + 1}/chat`, { timeout: TIMEOUT_MS });
      const body = JSON.parse(res.body.toString());
      expect(body).toStrictEqual({ error: 'Player ID does not exist' });
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Player ID does not exist' });
    });
  });

  describe('Success Cases', () => {
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
      requestPlayerJoin(sessionId, 'Syed');

      playerId1 = JSON.parse(player1.body.toString()).playerId;
      playerId2 = JSON.parse(player2.body.toString()).playerId;
    });

    test('Retrieve chat messages for a valid player ID', () => {
      sendMessage(playerId1, 'A test message');
      const currentTime1 = Math.floor(Date.now() / 1000);
      slync(2000);
      const currentTime2 = Math.floor(Date.now() / 1000);
      sendMessage(playerId1, 'Another test message');
      const res = getMessages(playerId1);
      expect(res.statusCode).toBe(200);

      const messages = JSON.parse(res.body.toString()).messages;
      expect(Array.isArray(messages)).toBe(true);

      if (messages.length > 0) {
        expect(checkTimestampRange(messages[0].timeSent, currentTime1, 1000)).toBe(true);
        expect(checkTimestampRange(messages[1].timeSent, currentTime2, 1000)).toBe(true);
        expect(messages[0].messageBody).toBe('A test message');
        expect(messages[1].messageBody).toBe('Another test message');
      }
    });

    test('Send and retrieve messages within the same session', () => {
      sendMessage(playerId1, 'Test Message');
      getMessages(playerId1);
      const res = getMessages(playerId1);
      expect(JSON.parse(res.body.toString())).toStrictEqual(
        {
          messages: [
            {
              messageBody: 'Test Message',
              playerId: playerId1,
              playerName: 'Mubashir',
              timeSent: expect.any(Number)
            }
          ]
        }
      );
      expect(res.statusCode).toStrictEqual(200);
    });

    test('Retrieve messages with varying timestamps', () => {
      sendMessage(playerId2, 'MessageOne');
      slync(1000);
      sendMessage(playerId2, 'MessageTwo');

      const res = getMessages(playerId2);
      expect(JSON.parse(res.body.toString())).not.toBe(
        {
          messages: [
            {
              messageBody: 'MessageTwo',
              playerId: playerId2,
              playerName: 'Mohammad',
              timeSent: expect.any(Number)
            },
            {
              messageBody: 'MessageOne',
              playerId: playerId2,
              playerName: 'Mohammad',
              timeSent: expect.any(Number)
            }
          ]
        }
      );
      expect(res.statusCode).toStrictEqual(200);
    });

    test('Retrieve messages when no messages exist', () => {
      // Ensure there are no messages sent
      const res = getMessages(playerId1);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ messages: [] });
    });
  });
});
