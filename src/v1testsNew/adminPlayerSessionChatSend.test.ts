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
  const res = request(
    'POST',
    SERVER_URL + `/v1/player/${playerId}/chat`,
    {
      json: { message: messageBody },
      timeout: TIMEOUT_MS,
    }
  );
  return res;
};

// Test Cases
beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminPlayerSessionChatSend Tests', () => {
  describe('Error Cases', () => {
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

    test('Player ID does not exist', () => {
      const res = sendMessage(playerId1 + 1, 'Hello');
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Player ID does not exist' });
    });

    test('Message body is less than 1 character', () => {
      const res = sendMessage(playerId2, '');
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Message body is less than 1 character' });
    });

    test('Message body is more than 100 characters', () => {
      const longMessage = 'a'.repeat(101);
      const res = sendMessage(playerId1, longMessage);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Message body is more than 100 characters' });
    });

    test('Message body contains only whitespace', () => {
      const res = sendMessage(playerId2, ' '.repeat(10));
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Message body is less than 1 character' });
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

    test('Send a valid chat message', () => {
      const res = sendMessage(playerId1, 'Hello, this is a test message.');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('Send a chat message exactly 100 characters long', () => {
      const validMessage = 'a'.repeat(100);
      const res = sendMessage(playerId2, validMessage);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });
  });
});
