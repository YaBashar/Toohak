import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;

// Helper Functions
/// //////////////////////////////////////////////

const createQuiz = (token : string, name : string, description : string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    { json: { token, name, description } }
  );
  return JSON.parse(res.body.toString());
};

const quizNameUpdate = (token : string, quizId : number, name : string) => {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/quiz/:quizid/name',
    { json: { token, name } }
  );
  return JSON.parse(res.body.toString());
};
/// //////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear');
});

describe('adminQuizNameUpdate Tests', () => {
  describe('Error Cases', () => {
    let token : string;
    let quizId : number;

    beforeEach(() => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'z5525050@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'sidak', nameLast: 'singh' } });
      token = JSON.parse(user.body.toString()).token;
      quizId = createQuiz(token, 'quizName', 'description').quizId;
    });

    test.each([

      {
        testName: 'Check fail for empty input',
        quizName: ' ',
        errorMessage: expect.any(String),
      },
      {
        testName: 'Check fail on short names',
        quizName: 'a',
        errorMessage: expect.any(String),
      },
      {
        testName: 'Check fail on short names',
        quizName: 'ab',
        errorMessage: expect.any(String),
      },
      {
        testName: 'Check fail on short names',
        quizName: 'abc',
        errorMessage: expect.any(String),
      },
      {
        testName: 'Check fail for names longer than 30 characters',
        quizName: 'abcdefghijklmnopqrstuvwxyzabcde',
        errorMessage: expect.any(String),
      },
      {
        testName: 'Check fail for quiz name with symbols',
        quizName: '&',
        errorMessage: expect.any(String),
      }

    ])('Test $# => $testName', ({ quizName, errorMessage }) => {
      const name = quizNameUpdate(token, quizId, 'Name');
      expect(name).toStrictEqual({ error: errorMessage });
      expect(name.statusCode).toStrictEqual(400);
    });

    // Testing Invalid User id and Quiz id
    test('Invalid User id', () => {
      const name = quizNameUpdate(token, quizId, 'Name');
      expect(name).toStrictEqual({ error: expect.any(String) });
      expect(name.statusCode).toStrictEqual(401);
    });

    test('Invalid Quiz id', () => {
      const name = quizNameUpdate(token, quizId, 'Name');
      expect(name).toStrictEqual({ error: expect.any(String) });
      expect(name.statusCode).toStrictEqual(403);
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const name = quizNameUpdate(token, quizId, 'Name');
      expect(name).toStrictEqual({ error: expect.any(String) });
      expect(name.statusCode).toStrictEqual(403);
    });

    test('Name is already used by the current logged in user for another quiz', () => {
      const quiz = createQuiz(token, 'anotherQuizName', 'description2').quizId;
      const nameUpdate = quizNameUpdate(token, quiz, 'Name');
      expect(nameUpdate).toStrictEqual({ error: expect.any(String) });
      expect(nameUpdate.statusCode).toStrictEqual(400);
    });
  });

  describe('Success Cases', () => {
    let token : string;
    let quizId : number;

    beforeEach(() => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'z5525050@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'sidak', nameLast: 'singh' } });
      token = JSON.parse(user.body.toString()).token;
      quizId = createQuiz(token, 'name', 'description').quizId;
    });

    test('Check that function returns empty object', () => {
      const name = quizNameUpdate(token, quizId, 'Name');
      expect(name).toStrictEqual({});
      expect(name.statusCode).toStrictEqual(200);
    });

    test('Check name has been updated successfully', () => {
      quizNameUpdate(token, quizId, 'newName');
      const updatedQuizInfo = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId}`, { qs: { token } });
      expect(updatedQuizInfo).toStrictEqual({
        quizId: quizId,
        name: 'newName',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'description',
        numQuestions: expect.any(Number),
        questions: [
        ]
      });
    });

    // redundant test?
    // test('Successfully Returned quizInfo after quizNameUpdate', () => {
    //   quizNameUpdate(token, quizId, 'newName');
    //   const updatedQuizInfo = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId}`, { qs: { token } });
    //   expect(updatedQuizInfo).toStrictEqual(
    //     {
    //       quizId: quizId,
    //       name: 'newName',
    //       timeCreated: expect.any(Number),
    //       timeLastEdited: expect.any(Number),
    //       description: 'description',
    //       numQuestions: expect.any(Number),
    //       questions: [
    //       ]
    //     }
    //   );
    // });
  });
});
