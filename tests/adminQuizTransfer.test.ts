import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;

// Helper Functions for requests
/// /////////////////////////////////////////////////////////////

const createQuiz = (token : string, name : string, description : string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    { json: { token, name, description } });
  return JSON.parse(res.body.toString());
};

/// /////////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear');
});

describe('adminQuizInfo Tests', () => {
  describe('Error Cases', () => {
    let token : string;
    let quizId : number;

    beforeEach(() => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'z5525050@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'sidak', nameLast: 'singh' } });
      token = JSON.parse(user.body.toString()).token;
      quizId = createQuiz(token, 'quizName', 'description').quizId;
    });

    test('Info of a Quiz which does not exist ', () => {
      const quizInfo = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId + 1}`, { qs: { token } });
      expect(JSON.parse(quizInfo.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizInfo.statusCode).toStrictEqual(403);
    });

    test('Info of a Quiz with invalid Authuser id', () => {
      const quizInfo = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId}`, { qs: { token: 'invalid_token' } });
      expect(quizInfo.statusCode).toStrictEqual(401);
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'z5525050@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'sidak', nameLast: 'singh' } });
      const token2 = JSON.parse(user.body.toString()).token;
      const quizId2 = createQuiz(token2, 'quizName2', 'description').quizId;
      const quizInfo = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId2}`, { qs: { token } });
      expect(JSON.parse(quizInfo.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizInfo.statusCode).toStrictEqual(403);
    });

    // userEmail is not a real user
    // userEmail is the current logged in user
    // Quiz ID refers to a quiz that has a name that is already used by the target user
  });


  describe('Success Cases', () => {
    let token : string;
    let quizId : number;

    beforeEach(() => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'z5525050@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'sidak', nameLast: 'singh' } });
      token = JSON.parse(user.body.toString()).token;
      quizId = createQuiz(token, 'quizName', 'description').quizId;
    });

    test.todo('Successful Transfer') {
      //Create another user
      //check that quiz id is under that user instead
      // check that quiz has been removed from original user.
    }
  });
});
