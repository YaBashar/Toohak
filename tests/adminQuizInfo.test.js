import { adminAuthRegister } from '../src/auth.js';
import { adminQuizInfo, adminQuizCreate, adminQuizNameUpdate } from '../src/quiz.js';
import { clear } from '../src/other.js';

import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;

// Helper Functions for requests
const createUser = (email, password, nameFirst, nameLast) => {
  const res = request(
    'POST',
    SERVER_URL + '/admin/auth/register',
    { json: { email: email, password: password, nameFirst: nameFirst, nameLast: nameLast } });
  return JSON.parse(res.body.toString());
};

const createQuiz = (token, name, description) => {
  const res = request(
    'POST',
    SERVER_URL + 'v1/admin/quiz',
    { json: { authUserId: token, name: name, description: description } });
  return JSON.parse(res.body.toString());
};

const quizNameUpdate = (token, quizId, name) => {
  const res = request(
    'PUT',
    SERVER_URL + 'v1/admin/quiz/:quizid/name',
    { json: { authUserId: token, quizId: quizId, name: name } }
  );
  return JSON.parse(res.body.toString());
};

beforeEach(() => {
  request('DELETE', SERVER_URL + 'v1/clear');
});

describe('adminQuizInfo Tests', () => {
  describe('Error Cases', () => {
    let authUserId;
    let quizId;

    beforeEach(() => {
      authUserId = createUser('hayden@gmail.com', '1password', 'Hayden', 'Smith').authUserId;
      quizId = createQuiz(createUser.authUserId, 'quizName', 'description').quizId;
    });

    test('Info of a Quiz which does not exist ', () => {
      const quizInfo = request('GET', SERVER_URL + `v1/admin/quiz/${quizId + 1}`, { qs: { authUserId } });
      expect(JSON.parse(quizInfo.body.toString())).toStrictEqual({ error: expect.any(String) });
    });

    test('Info of a Quiz with invalid Authuser id', () => {
      // const quizInfo = request('GET', SERVER_URL + `/admin/quiz/${quizId}`, { qs: { authUserId } });
      // expect(JSON.parse(quizInfo.body.toString())).toStrictEqual({ error: expect.any(String) });
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      // const result = adminQuizInfo(authUserId + 1, quizId, 'Any description');
      // expect(result).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('Success Cases', () => {
    let authUserId;
    let quizId;

    beforeEach(() => {
      authUserId = createUser('hayden@gmail.com', '1password', 'Hayden', 'Smith');
      quizId = createQuiz(createUser.authUserId, 'quizName', 'description');
    });

    test('Successfully Returned quizInfo', () => {
      const quizInfo = request('GET', SERVER_URL + 'v1/admin/quiz/:quizid', { qs: { authUserId } });
      expect(JSON.parse(quizInfo.body.toString())).toStrictEqual(
        {
          quizId: quizId,
          name: 'quizname',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'description',
          numQuestions: expect.any(Number),

          questions: [
            {
              questionId: expect.any(Number),
              question: expect.any(String),
              duration: expect.any(Number),
              points: expect.any(Number),
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: expect.any(String),
                  colour: expect.any(String),
                  correct: expect.toBeTrue()
                }
              ]
            },
          ]
        }
      );
    });

    test('Successfully Returned quizInfo after quizNameUpdate', () => {
      quizNameUpdate(1243, quizId, 'newName');
      const updatedQuizInfo = request('GET', SERVER_URL + 'v1/admin/quiz/:quizid', { qs: { authUserId } });
      expect(updatedQuizInfo).toStrictEqual(
        {
          quizId: quizId,
          name: 'newName',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'description',
          numQuestions: expect.any(Number),

          questions: [
            {
              questionId: expect.any(Number),
              question: expect.any(String),
              duration: expect.any(Number),
              points: expect.any(Number),
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: expect.any(String),
                  colour: expect.any(String),
                  correct: expect.toBeTrue()
                }
              ]
            },
          ]
        }
      );
    });
  });
});
