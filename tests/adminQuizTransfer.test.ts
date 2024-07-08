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
    let sourceToken : string;
    let targetToken : string;
    let quizId : number;

    beforeEach(() => {
      const sourceUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'sourceuser@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'Mubashir', nameLast: 'Hussain' } });
      sourceToken = JSON.parse(sourceUser.body.toString()).token;

      const targetUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'targetuser@unsw.edu.au', password: '124ABCabc@#$', nameFirst: 'Muhammad', nameLast: 'Chowdhury' } });
      targetToken = JSON.parse(targetUser.body.toString()).token;

      quizId = createQuiz(sourceToken, 'quizName', 'description').quizId;
    });

    test('Transferring Quiz which does not exist ', () => {
      const quizTransfer = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId + 1}/transfer`, { json: { sourceToken, email: 'targetuser@unsw.edu.au' } });
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toStrictEqual(403);
    });

    test('Transfer of a Quiz with invalid Authuser id', () => {
      const quizTransfer = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { token: 'Invalid_token', email: 'targetuser@unsw.edu.au' } });
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toStrictEqual(401);
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const quizId2 = createQuiz(targetToken, 'quizName2', 'description').quizId;
      const quizTransfer = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId2}/transfer`, { json: { token: sourceToken, email: 'targetuser@unsw.edu.au' } });

      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toStrictEqual(403);
    });

    // userEmail is not a real user
    test('target user email is not a real user', () => {
      const quizTransfer = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { sourceToken, email: 'gurigiurabgiurag@email.unsw.edu.au' } });
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: 'target user email is not a real user' });
      expect(quizTransfer.statusCode).toBe(400);
    });

    // userEmail is the current logged in user
    test('Destination user email is the same as current user email', () => {
      const quizTransfer = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { sourceToken, email: 'sourceuser@unsw.edu.au' } });
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: 'target user email is the same as source user email' });
      expect(quizTransfer.statusCode).toBe(400);
    });

    // Quiz ID refers to a quiz that has a name that is already used by the target user
    test('Quiz has name already used by target user', () => {
      const quiz2 = createQuiz(targetToken, 'quizName', 'description').quizId;
      const quizTransfer = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { sourceToken, email: 'targetuser@unsw.edu.au' } });
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: 'Quiz name already in use by target user' });
    });
  });

  describe('Success Cases', () => {
    let sourceToken : string;
    let targetToken : string;
    let quizId : number;

    beforeEach(() => {
      const sourceUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'sourceuser@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'Mubashir', nameLast: 'Hussain' } });
      sourceToken = JSON.parse(sourceUser.body.toString()).token;

      const targetUser = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'targetuser@unsw.edu.au', password: '124ABCabc@#$', nameFirst: 'Muhammad', nameLast: 'Chowdhury' } });
      targetToken = JSON.parse(targetUser.body.toString()).token;

      quizId = createQuiz(sourceToken, 'quizName', 'description').quizId;
    });

    test('Check that transferred quiz is under name of target user through quizList', () => {
      request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { sourceToken, email: 'targetuser@unsw.edu.au' } });
      const quizList = request('GET', SERVER_URL + '/v1/admin/quiz/list', { json: { targetToken } });

      expect(quizList.body.toString()).toStrictEqual({
        quizzes:
        [
          {
            quizId: quizId,
            name: 'quizName'
          }
        ]
      });

      test('Check that transferred quiz has been removed from source user through quizList', () => {
        request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { sourceToken, email: 'targetuser@unsw.edu.au' } });
        const quizList = request('GET', SERVER_URL + '/v1/admin/quiz/list', { json: { sourceToken } });

        expect(quizList.body.toString()).toStrictEqual({
          quizzes: []
        });
      });
    });
  });
});
