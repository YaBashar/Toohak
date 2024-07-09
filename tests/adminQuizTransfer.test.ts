import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import { getData } from '../src/dataStore';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions for requests
/// /////////////////////////////////////////////////////////////

const createQuiz = (token : string, name : string, description : string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    { json: { token, name, description }, timeout: TIMEOUT_MS });
  return JSON.parse(res.body.toString());
};

/// /////////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizTransfer Tests', () => {
  describe('Error Cases', () => {
    let sourceToken : string;
    let targetToken : string;
    let quizId : number;

    beforeEach(() => {
      const sourceUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'sourceuser@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'Mubashir', nameLast: 'Hussain' }, timeout: TIMEOUT_MS });
      sourceToken = JSON.parse(sourceUser.body.toString()).token;

      const targetUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'targetuser@unsw.edu.au', password: '124ABCabc@#$', nameFirst: 'Muhammad', nameLast: 'Chowdhury' }, timeout: TIMEOUT_MS });
      targetToken = JSON.parse(targetUser.body.toString()).token;

      quizId = createQuiz(sourceToken, 'quizName', 'description').quizId;
    });

    test('Transferring Quiz which does not exist ', () => {
      const quizTransfer = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId + 1}/transfer`, { json: { token: sourceToken, email: 'targetuser@unsw.edu.au' }, timeout: TIMEOUT_MS });
      JSON.parse(quizTransfer.body.toString());
      expect(quizTransfer.statusCode).toStrictEqual(403);
    });

    test('Transfer of a Quiz with invalid Authuser id', () => {
      const quizTransfer = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { token: 'Invalid_token', email: 'targetuser@unsw.edu.au' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toStrictEqual(401);
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const quizTransfer = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId + 1}/transfer`, { json: { token: sourceToken, email: 'targetuser@unsw.edu.au' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toStrictEqual(403);
    });

    // userEmail is not a real user
    test('target user email is not a real user', () => {
      const quizTransfer = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { token: sourceToken, email: 'gurigiurabgiurag@email.unsw.edu.au' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toBe(400);
    });

    // userEmail is the current logged in user
    test('Destination user email is the same as current user email', () => {
      const quizTransfer = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { token: sourceToken, email: 'sourceuser@unsw.edu.au' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toBe(400);
    });

    // Quiz ID refers to a quiz that has a name that is already used by the target user
    test('Quiz has name already used by target user', () => {
      const quiz2 = createQuiz(targetToken, 'quizName', 'description').quizId;
      const quizTransfer = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz2}/transfer`, { json: { token: sourceToken, email: 'targetuser@unsw.edu.au' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toBe(400);
    });
  });

  describe('Success Cases', () => {
    let sourceToken : string;
    let targetToken : string;
    let quizId : number;

    beforeEach(() => {
      const sourceUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'sourceuser@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'Mubashir', nameLast: 'Hussain' }, timeout: TIMEOUT_MS });
      sourceToken = JSON.parse(sourceUser.body.toString()).token;

      const targetUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'targetuser@unsw.edu.au', password: '124ABCabc@#$', nameFirst: 'Muhammad', nameLast: 'Chowdhury' }, timeout: TIMEOUT_MS });
      targetToken = JSON.parse(targetUser.body.toString()).token;

      quizId = createQuiz(sourceToken, 'quizName', 'description').quizId;
    });

    // check that function returns empty object
    test('Check that function returns empty object', () => {
      const quizTransfer = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { token: sourceToken, email: 'targetuser@unsw.edu.au' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({});
    });

    test('Check that transferred quiz is under name of target user through quizList', () => {
      request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { token: sourceToken, email: 'targetuser@unsw.edu.au' }, timeout: TIMEOUT_MS });
      const quizList = request('GET', SERVER_URL + '/v1/admin/quiz/list', { json: { token: targetToken }, timeout: TIMEOUT_MS });

      expect(JSON.parse(quizList.body.toString())).toStrictEqual({
        quizzes:
        [
          {
            quizId: quizId,
            name: 'quizName',
          }
        ]
      });
    });

    test('Check that transferred quiz has been removed from source user through quizList', () => {
      request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { token: sourceToken, email: 'targetuser@unsw.edu.au' }, timeout: TIMEOUT_MS });
      const quizList = request('GET', SERVER_URL + '/v1/admin/quiz/list', { json: { token: sourceToken }, timeout: TIMEOUT_MS });

      expect(JSON.parse(quizList.body.toString())).toStrictEqual({
        quizzes: []
      });
    });
  });
});
