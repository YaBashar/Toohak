import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;

// Helper Functions for requests
/// /////////////////////////////////////////////////////////////
const createUser = (email, password, nameFirst, nameLast) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    { json: { email, password, nameFirst, nameLast } });
  return JSON.parse(res.body.toString());
};

const createQuiz = (token, name, description) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    { json: { token, name, description } });
  return JSON.parse(res.body.toString());
};

const quizNameUpdate = (token, quizId, name) => {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/quiz/:quizid/name',
    { json: { token, quizId, name } }
  );
  return JSON.parse(res.body.toString());
};
/// /////////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear');
});

describe('adminQuizInfo Tests', () => {
  describe('Error Cases', () => {
    let token;
    let quizId;

    beforeEach(() => {
      token = createUser('hayden@gmail.com', '1password', 'Hayden', 'Smith').token;
      quizId = createQuiz(token, 'quizName', 'description').quizId;
    });

    test('Info of a Quiz which does not exist ', () => {
      const quizInfo = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId + 1}`, { qs: { token } });
      expect(JSON.parse(quizInfo.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizInfo.statusCode).toStrictEqual(401);
    });

    test('Info of a Quiz with invalid Authuser id', () => {
      const quizInfo = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId}`, { qs: { token: token + 1 } });
      expect(JSON.parse(quizInfo.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizInfo.statusCode).toStrictEqual(401);
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const token2 = createUser('mubashir@gmail.com', '2password', 'Mubashir', 'Hussain').token;
      const quizId2 = createQuiz(token2, 'quizName2', 'description').quizId;
      const quizInfo = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId2}`, { qs: { token } });
      expect(JSON.parse(quizInfo.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizInfo.statusCode).toStrictEqual(403);
    });
  });

  describe('Success Cases', () => {
    let token;
    let quizId;

    beforeEach(() => {
      token = createUser('hayden@gmail.com', '1password', 'Hayden', 'Smith');
      quizId = createQuiz(token, 'quizName', 'description');
    });

    test('Successfully Returned quizInfo', () => {
      const quizInfo = request('GET', SERVER_URL + '/v1/admin/quiz/:quizid', { qs: { token } });
      expect(JSON.parse(quizInfo.body.toString())).toStrictEqual(
        {
          quizId: quizId,
          name: 'quizname',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'description',
          numQuestions: expect.any(Number),

          questions: [
          ]
        }
      );
      expect(quizInfo.statusCode).toStrictEqual(200);
    });

    test('Successfully Returned quizInfo after quizNameUpdate', () => {
      quizNameUpdate(token, quizId, 'newName');
      const updatedQuizInfo = request('GET', SERVER_URL + '/v1/admin/quiz/:quizid', { qs: { token } });
      expect(updatedQuizInfo).toStrictEqual(
        {
          quizId: quizId,
          name: 'newName',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'description',
          numQuestions: expect.any(Number),

          questions: [
          ]
        }
      );
      expect(updatedQuizInfo.statusCode).toStrictEqual(200);
    });
  });
});
