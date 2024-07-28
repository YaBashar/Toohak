import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions for requests
/// /////////////////////////////////////////////////////////////

const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/register',
    { json: { email, password, nameFirst: firstName, nameLast: lastName } }
  ));
};

const createQuiz = (token : string, name : string, description : string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    { json: { token, name, description } });
  return JSON.parse(res.body.toString());
};

const requestQuizInfo = (token : string, quizId : number) => {
  return (request('GET', SERVER_URL + `/v1/admin/quiz/${quizId}`, { qs: { token: token } }));
};
/// /////////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear');
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizInfo Tests', () => {
  describe('Error Cases', () => {
    let token : string;
    let quizId : number;

    beforeEach(() => {
      const user = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
      token = JSON.parse(user.body.toString()).token;
      quizId = createQuiz(token, 'quizName', 'description').quizId;
    });

    test('Info of a Quiz which does not exist ', () => {
      const quizInfo = requestQuizInfo(token, quizId + 1);
      expect(JSON.parse(quizInfo.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizInfo.statusCode).toStrictEqual(403);
    });

    test('Info of a Quiz with invalid Authuser id', () => {
      const quizInfo = requestQuizInfo('invalid_token', quizId);
      expect(quizInfo.statusCode).toStrictEqual(401);
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const user = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
      const token2 = JSON.parse(user.body.toString()).token;
      const quizId2 = createQuiz(token2, 'quizName2', 'description').quizId;
      const quizInfo = requestQuizInfo(token, quizId2);
      expect(JSON.parse(quizInfo.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizInfo.statusCode).toStrictEqual(403);
    });
  });

  describe('Success Cases', () => {
    let token : string;
    let quizId : number;

    beforeEach(() => {
      const user = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
      token = JSON.parse(user.body.toString()).token;
      quizId = createQuiz(token, 'quizName', 'description').quizId;
    });

    test('Successfully Returned quizInfo', () => {
      const quizInfo = requestQuizInfo(token, quizId);
      expect(JSON.parse(quizInfo.body.toString())).toStrictEqual(
        {
          quizId: quizId,
          name: 'quizName',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'description',
          numQuestions: expect.any(Number),
          questions: expect.any(Array),
          duration: expect.any(Number),
        }
      );
      expect(quizInfo.statusCode).toStrictEqual(200);
    });

    test('Timestamp is in range', () => {
      const quizInfo = requestQuizInfo(token, quizId);
      const quiz = JSON.parse(quizInfo.body.toString());
      const timestamp = Math.floor(new Date().getTime() / 1000);
      expect(quiz.timeLastEdited).toBeLessThanOrEqual(timestamp);
    });
  });
});
