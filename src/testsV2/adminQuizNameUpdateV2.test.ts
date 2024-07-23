import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions
/// //////////////////////////////////////////////
const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  return request('POST', SERVER_URL + '/v1/admin/auth/register',
    { json: { email, password, nameFirst: firstName, nameLast: lastName } }
  );
};

const createQuiz = (token : string, name : string, description : string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    { json: { token, name, description }, timeout: TIMEOUT_MS }
  );
  return JSON.parse(res.body.toString());
};

const quizNameUpdate = (token : string, quizId : number, name : string) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizId}/name`,
    {
      headers: { token },
      json: { name },
      timeout: TIMEOUT_MS
    }
  );
  return res;
};

const quizInfo = (token: string, quizId: number) => {
  const res = request(
    'GET',
    `${SERVER_URL}/v1/admin/quiz/${quizId}`,
    { qs: { token } }
  );
  return JSON.parse(res.body.toString());
};
/// //////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizNameUpdate Tests', () => {
  describe('Error Cases', () => {
    let token : string;
    let quizId : number;

    beforeEach(() => {
      const user = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
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
      const name = quizNameUpdate(token, quizId, quizName);
      expect(JSON.parse(name.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(name.statusCode).toStrictEqual(400);
    });

    // Testing Invalid User id and Quiz id
    test('Invalid User id', () => {
      const name = quizNameUpdate('invalid_token', quizId, 'Name');
      expect(JSON.parse(name.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(name.statusCode).toStrictEqual(401);
    });

    test('Invalid Quiz id', () => {
      const name = quizNameUpdate(token, quizId + 1, 'Name');
      expect(JSON.parse(name.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(name.statusCode).toStrictEqual(403);
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      // create another user with quiz and then pass that quiz id
      const name = quizNameUpdate(token, quizId + 1, 'Name');
      expect(JSON.parse(name.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(name.statusCode).toStrictEqual(403);
    });

    test('Name is already used by the current logged in user for another quiz', () => {
      const quiz = createQuiz(token, 'sameQuiz', 'description2').quizId;
      const nameUpdate = quizNameUpdate(token, quiz, 'sameQuiz');
      expect(JSON.parse(nameUpdate.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(nameUpdate.statusCode).toStrictEqual(400);
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

    test('Check that function returns empty object', () => {
      const name = quizNameUpdate(token, quizId, 'Name');
      expect(JSON.parse(name.body.toString())).toStrictEqual({});
    });

    test('Check name has been updated successfully through QuizInfo', () => {
      quizNameUpdate(token, quizId, 'newName');
      const result = quizInfo(token, quizId);
      expect(result).toStrictEqual({
        quizId: quizId,
        name: 'newName',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'description',
        numQuestions: expect.any(Number),
        questions: expect.any(Array),
        duration: expect.any(Number)
      });
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
        quizNameUpdate(token, quizId, 'changeName');
        const quizInfoResponse = quizInfo(token, quizId);
        const updatedTimeLastEdited = quizInfoResponse.timeLastEdited;
        expect(updatedTimeLastEdited).not.toEqual(initialTimeCreated);
        done();
      }, 1000);
    });
  });
});
