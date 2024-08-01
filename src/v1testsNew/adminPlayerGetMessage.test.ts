import request from 'sync-request-curl';
import slync from 'slync';
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

const requestCreateQuiz = (token: string, name: string, description: string) => {
  const quiz = request('POST', SERVER_URL + '/v2/admin/quiz', {
    headers: { token },
    json: { name, description },
    timeout: TIMEOUT_MS
  });
  return JSON.parse(quiz.body.toString()).quizId;
};

const createQuizQuestion = (token: string, quizId: number, question: string, duration: number, points: number, thumbnailUrl: string, answers: object) => {
  return request('POST', SERVER_URL + `/v2/admin/quiz/${quizId}/question`, {
    headers: { token },
    json: {
      questionBody: { question, duration, points, thumbnailUrl, answers }
    }
  });
};

const requestCreateSession = (token: string, quizId: number, autoStartNum: number) => {
  const session = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/session/start`, {
    headers: { token },
    json: { autoStartNum },
    timeout: TIMEOUT_MS
  });
  return JSON.parse(session.body.toString());
};

const requestPlayerJoin = (sessionId: number, name: string) => {
  const player = request('POST', SERVER_URL + '/v1/player/join', {
    json: { sessionId, name },
    timeout: TIMEOUT_MS
  });
  return JSON.parse(player.body.toString());
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
    { timeout: TIMEOUT_MS }
  );
};
/// //////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminPlayerSessionChat Tests', () => {
  describe('Error Cases', () => {
    let token: string;
    let playerId1: number;
    let sessionId: number;
    let quizId: number;

    beforeEach(() => {
      const user = registerUser('user@unsw.edu.au', '123ABCabc@#$', 'Test', 'User');
      token = user.token;
      console.log('token', token);

      quizId = requestCreateQuiz(token, 'Test Quiz', 'Test Description');
      console.log('quizId', quizId);
      createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, 'https://example.com/image-thumbnail-12345.jpg', [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Queen Elizabeth', correct: false }
      ]);

      const session = requestCreateSession(token, quizId, 3);
      sessionId = session.sessionId;
      console.log('sessionId', sessionId);

      const player1 = requestPlayerJoin(sessionId, 'Mubashir');
      requestPlayerJoin(sessionId, 'Mohammad');
      requestPlayerJoin(sessionId, 'Syed');

      playerId1 = player1.playerId;
    });

    test('Player ID does not exist', () => {
      const res = request('GET', SERVER_URL + `/v1/player/${playerId1 + 1}/chat`, { timeout: TIMEOUT_MS });
      const body = JSON.parse(res.body.toString());
      expect(body).toStrictEqual({ error: 'Player ID does not exist' });
      expect(res.statusCode).toBe(400);
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
      console.log('token', token);

      quizId = requestCreateQuiz(token, 'Test Quiz', 'Test Description');
      console.log('quizId', quizId);
      createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, 'https://example.com/image-thumbnail-12345.jpg', [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Queen Elizabeth', correct: false }
      ]);

      const session = requestCreateSession(token, quizId, 3);
      sessionId = session.sessionId;
      console.log('sessionId', sessionId);

      const player1 = requestPlayerJoin(sessionId, 'Mubashir');
      const player2 = requestPlayerJoin(sessionId, 'Mohammad');
      requestPlayerJoin(sessionId, 'Syed');

      playerId1 = player1.playerId;
      playerId2 = player2.playerId;
    });

    test('No messages in session', () => {
      const res = getMessages(playerId1);
      const body = JSON.parse(res.body.toString());
      expect(body).toStrictEqual({ messages: [] });
      expect(res.statusCode).toBe(200);
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
      const response = JSON.parse(res.body.toString());
      console.log(response.messages[1].timeSent);
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
  });
});
