import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions
/// //////////////////////////////////////////////

const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  return request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst: firstName, nameLast: lastName }
  });
};

const createQuiz = (token : string, name : string, description : string) => {
  const res = request('POST', SERVER_URL + '/v2/admin/quiz', {
    headers: { token }, json: { name, description }
  });
  return JSON.parse(res.body.toString());
};
const createQuizQuestion = (token: string, quizid: number, question: string, duration: number, points: number, thumbnailUrl: string, answers: object) => {
  return request('POST', SERVER_URL + `/v2/admin/quiz/${quizid}/question`, {
    headers: {
      token,
    },
    json: {
      questionBody: {
        question,
        duration,
        points,
        thumbnailUrl,
        answers,
      }
    }
  });
};

const requestCreateSession = (token: string, quizid: number, autoStartNum: number) => {
  return (request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/session/start`, {
    headers: { token }, json: { autoStartNum: autoStartNum }, timeout: TIMEOUT_MS
  }));
};

const requestPlayerJoin = (sessionId: number, name: string) => {
  return (request('POST', SERVER_URL + '/v1/player/join', {
    json: { sessionId, name }, timeout: TIMEOUT_MS
  }));
};

const requestPlayerSessionInfo = (playerId : number) => {
  return (request('GET', SERVER_URL + `/v1/player/${playerId}`, {
    qs: { playerId: playerId }, timeout: TIMEOUT_MS
  }));
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminGameSessionStatusInfo Tests', () => {
  describe('Error Cases', () => {
    let token : string;
    let quizId : number;
    let sessionId : number;
    let playerId : number;

    beforeEach(() => {
      const user = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
      token = JSON.parse(user.body.toString()).token;
      quizId = createQuiz(token, 'quizName', 'description').quizId;

      createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, 'https://example.com/image-thumbnail-12345.jpg', [
        { answer: 'Prince Charles', correct: true }, { answer: 'Queen Elizabeth', correct: false }
      ]);

      const session = requestCreateSession(token, quizId, 3);
      sessionId = JSON.parse(session.body.toString()).sessionId;

      const player = requestPlayerJoin(sessionId, 'Mubashir');
      playerId = JSON.parse(player.body.toString()).playerId;
    });

    test('Player Id does not exist', () => {
      const res = requestPlayerSessionInfo(playerId + 1);
      const parse = JSON.parse(res.body.toString());
      console.log(parse);
      expect(parse).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(400);
    });
  });

  describe('Success Cases', () => {
    let token : string;
    let quizId : number;
    let sessionId : number;
    let playerId : number;

    beforeEach(() => {
      const user = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
      token = JSON.parse(user.body.toString()).token;
      quizId = createQuiz(token, 'quizName', 'description').quizId;

      createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, 'https://example.com/image-thumbnail-12345.jpg', [
        { answer: 'Prince Charles', correct: true }, { answer: 'Queen Elizabeth', correct: false }
      ]);

      const session = requestCreateSession(token, quizId, 3);
      sessionId = JSON.parse(session.body.toString()).sessionId;

      const player = requestPlayerJoin(sessionId, 'Mubashir');
      playerId = JSON.parse(player.body.toString()).playerId;
    });

    test('Gets correct information', () => {
      const res = requestPlayerSessionInfo(playerId);
      const parse = JSON.parse(res.body.toString());
      console.log(parse);
      expect(parse).toStrictEqual(
        {
          state: expect.any(String),
          numQuestions: expect.any(Number),
          atQuestion: expect.any(Number)
        }
      );
    });
  });
});
