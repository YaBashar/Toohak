import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions
/// //////////////////////////////////////////////

const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/register',
    { json: { email, password, nameFirst: firstName, nameLast: lastName } }
  ));
};

const createQuiz = (token : string, name : string, description : string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v2/admin/quiz',
    { headers: { token }, json: { name, description }, timeout: TIMEOUT_MS }
  );
  return JSON.parse(res.body.toString());
};

const createQuizQuestion = (token : string, quizId : number, questionBody : object) => {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question`,
    { headers: { token }, json: { questionBody: questionBody }, timeout: TIMEOUT_MS }
  );
  return JSON.parse(res.body.toString());
};

const quizInfo = (token: string, quizId: number) => {
  const res = request(
    'GET',
    `${SERVER_URL}/v1/admin/quiz/${quizId}`,
    { qs: { token } }
  );
  return JSON.parse(res.body.toString());
};

const requestDuplicateQuestion = (token : string, quizId : number, questionId : number) => {
  return (request('POST', SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, { headers: { token }, timeout: TIMEOUT_MS }));
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
      const user = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
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

    test('Duplicating of a Question with invalid Authuser id', () => {
      const duplicateQuestion = requestDuplicateQuestion('invalid_token', quizId, questionId);
      expect(JSON.parse(duplicateQuestion.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(duplicateQuestion.statusCode).toStrictEqual(401);
    });

    test('Duplicating Question when Quiz does not exist ', () => {
      const duplicateQuestion = requestDuplicateQuestion(token, quizId + 1, questionId);
      expect(JSON.parse(duplicateQuestion.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(duplicateQuestion.statusCode).toStrictEqual(403);
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const duplicateQuestion = requestDuplicateQuestion(token, quizId + 1, questionId);
      expect(JSON.parse(duplicateQuestion.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(duplicateQuestion.statusCode).toStrictEqual(403);
    });

    test('Question Id does not refer to a valid question within this quiz', () => {
      const user2 = createUser('mubashir@unsw.edu.au', '124ADCabc@#$', 'mubashir', 'hussain');
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

      const duplicateQuestion = requestDuplicateQuestion(token, quizId, questionId2);
      expect(JSON.parse(duplicateQuestion.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(duplicateQuestion.statusCode).toStrictEqual(400);
    });
  });

  describe('Success Cases', () => {
    let token : string;
    let quizId : number;
    let questionId : number;

    beforeEach(() => {
      const user = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
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
      const quizDuplicate = requestDuplicateQuestion(token, quizId, questionId);
      const questId = JSON.parse(quizDuplicate.body.toString()).newQuestionId;
      const info = quizInfo(token, quizId);
      expect(info).toStrictEqual(
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
              questionId: questId,
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

    test('Testing timeLastEdited property is the same as timeCreated', () => {
      const quiz = createQuiz(token, 'newQuiz', 'description');
      const initialTimeCreated = quiz.timeCreated;
      const initialTimeEdited = quiz.timeLastEdited;

      expect(initialTimeCreated).toEqual(initialTimeEdited);
    });

    test('Testing timeLastEdited property has been changed', (done) => {
      const createQuizResponse = createQuiz(token, 'newQuiz', 'description');
      const quizId = createQuizResponse.quizId;
      const initialTimeCreated = createQuizResponse.timeCreated;

      setTimeout(() => {
        requestDuplicateQuestion(token, quizId, questionId);
        const quizInfoResponse = quizInfo(token, quizId);
        const updatedTimeLastEdited = quizInfoResponse.timeLastEdited;
        expect(updatedTimeLastEdited).not.toEqual(initialTimeCreated);
        done();
      }, 1000);
    });

    test('Successful quiz question duplicate', () => {
      const duplicatedQuestion = requestDuplicateQuestion(token, quizId, questionId);
      expect(JSON.parse(duplicatedQuestion.body.toString())).toStrictEqual({ newQuestionId: expect.any(Number) });
      const quiz = quizInfo(token, quizId);
      expect(quiz.questions.length).toEqual(2);
      expect(quiz.questions[1].questionId).not.toEqual(questionId);
    });
  });
});
