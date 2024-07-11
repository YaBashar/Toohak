import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions
/// //////////////////////////////////////////////

// Question Body Interface

const createQuiz = (token : string, name : string, description : string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    { json: { token, name, description }, timeout: TIMEOUT_MS }
  );
  return JSON.parse(res.body.toString());
};

const createQuizQuestion = (token : string, quizId : number, questionBody : object) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
    { json: { token: token, questionBody: questionBody }, timeout: TIMEOUT_MS }
  );
  return JSON.parse(res.body.toString());
};
/// //////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizQuestionDuplicate Tests', () => {
  describe('Error Cases', () => {
    let token : string;
    let quizId : number;
    let questionId : number;

    beforeEach(() => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'z5525050@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'sidak', nameLast: 'singh' }, timeout: TIMEOUT_MS });
      token = JSON.parse(user.body.toString()).token;
      quizId = createQuiz(token, 'quizName', 'description').quizId;

      questionId = createQuizQuestion(token, quizId,
        {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: false,
            },
            {
              answer: 'Prince is not Charles',
              correct: true,
            },
            {
              answer: 'Prince is Beckham',
              correct: false,
            }
          ]
        }).questionId;
    });

    test('Duplicating of a Quiz with invalid Authuser id', () => {
      const duplicateQuiz = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { json: { token: 'Invalid_token' }, timeout: TIMEOUT_MS });
      expect(JSON.parse(duplicateQuiz.body.toString())).toStrictEqual({ error: 'Invalid User id' });
      expect(duplicateQuiz.statusCode).toStrictEqual(401);
    });

    test('Duplicating Question when Quiz does not exist ', () => {
      const duplicateQuiz = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId + 1}/question/${questionId}/duplicate`, { json: { token }, timeout: TIMEOUT_MS });
      expect(JSON.parse(duplicateQuiz.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(duplicateQuiz.statusCode).toStrictEqual(403);
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const duplicateQuiz = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId + 1}/question/${questionId}/duplicate`, { json: { token }, timeout: TIMEOUT_MS });
      expect(JSON.parse(duplicateQuiz.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(duplicateQuiz.statusCode).toStrictEqual(403);
    });

    test('Question Id does not refer to a valid question within this quiz', () => {
      const user2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'mubashir@unsw.edu.au', password: '124ADCabc@#$', nameFirst: 'mubashir', nameLast: 'hussain' }, timeout: TIMEOUT_MS });
      const token2 = JSON.parse(user2.body.toString()).token;
      const quizId2 = createQuiz(token2, 'quizName', 'description').quizId;

      const questionId2 = createQuizQuestion(token2, quizId2, {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          {
            answer: 'Prince Charles',
            correct: false,
          },
          {
            answer: 'Prince is not Charles',
            correct: true,
          },
          {
            answer: 'Prince is Beckham',
            correct: false,
          }
        ]
      }).questionId;

      const duplicateQuiz = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId2}/duplicate`, { json: { token }, timeout: TIMEOUT_MS });
      expect(JSON.parse(duplicateQuiz.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(duplicateQuiz.statusCode).toStrictEqual(400);
    });
  });

  describe('Success Cases', () => {
    let token : string;
    let quizId : number;
    let questionId : number;

    beforeEach(() => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'z5525050@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'sidak', nameLast: 'singh' }, timeout: TIMEOUT_MS });
      token = JSON.parse(user.body.toString()).token;
      quizId = createQuiz(token, 'quizName', 'description').quizId;

      questionId = createQuizQuestion(token, quizId,
        {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: false,
            },
            {
              answer: 'Prince is not Charles',
              correct: true,
            },
            {
              answer: 'Prince is Beckham',
              correct: false,
            }
          ]
        }).questionId;
    });

    test('success duplicating quiz question through QuizInfo', () => {
      const quizDuplicateId = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { json: { token }, timeout: TIMEOUT_MS });
      const quizInfo = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId}`, { qs: { token } });
      console.log(quizInfo.body.toString());
      expect(JSON.parse(quizInfo.body.toString())).toStrictEqual(
        {
          quizId: quizId,
          name: 'quizName',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'description',
          numQuestions: expect.any(Number),
          questions: [
            {
              questionId: questionId,
              question: 'Who is the Monarch of England?',
              duration: 4,
              points: 5,
              answers: [
                {
                  answer: 'Prince Charles',
                  correct: false,
                },
                {
                  answer: 'Prince is not Charles',
                  correct: true,
                },
                {
                  answer: 'Prince is Beckham',
                  correct: false,
                }
              ]
            },
            {
              questionId: JSON.parse(quizDuplicateId.body.toString()).questionId,
              question: 'Who is the Monarch of England?',
              duration: 4,
              points: 5,
              answers: [
                {
                  answer: 'Prince Charles',
                  correct: false,
                },
                {
                  answer: 'Prince is not Charles',
                  correct: true,
                },
                {
                  answer: 'Prince is Beckham',
                  correct: false,
                }
              ]
            }

          ],
          duration: expect.any(Number)
        }
      );
    });

    test('successfully returns new Question id', () => {
      const duplicateQuiz = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { json: { token }, timeout: TIMEOUT_MS });
      expect(JSON.parse(duplicateQuiz.body.toString())).toStrictEqual({ questionId: expect.any(Number) });
    });
  });
});
