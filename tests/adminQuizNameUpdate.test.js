import { adminQuizInfo, adminQuizNameUpdate } from '../src/quiz.js';
import { adminAuthRegister } from '../src/auth';
import { adminQuizCreate } from '../src/quiz.js';
import { clear } from '../src/other.js';

beforeEach(() => {
  clear();
});

describe('adminQuizNameUpdate Tests', () => {
  describe('Error Cases', () => {
    let authUserId;
    let quizId;

    beforeEach(() => {
      authUserId = adminAuthRegister('email@gmail.com', '1password', 'firstname', 'lastname').authUserId;
      quizId = adminQuizCreate(authUserId, 'quizname', 'description').quizId;
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
      const name = adminQuizNameUpdate(authUserId, quizId, quizName);
      expect(name).toStrictEqual({ error: errorMessage });
    });

    // Testing Invalid User id and Quiz id
    test('Invalid User id', () => {
      const name = adminQuizNameUpdate(authUserId + 1, quizId, 'Name');
      expect(name).toStrictEqual({ error: expect.any(String) });
    });

    test('Invalid Quiz id', () => {
      const name = adminQuizNameUpdate(authUserId, quizId + 1, 'Name');
      expect(name).toStrictEqual({ error: expect.any(String) });
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const name = adminQuizNameUpdate(authUserId + 1, quizId, 'Name');
      expect(name).toStrictEqual({ error: expect.any(String) });
    });

    test('Name is already used by the current logged in user for another quiz', () => {
      adminQuizCreate(authUserId, 'anotherQuizName', 'description2');
      const nameUpdate = adminQuizNameUpdate(authUserId, quizId, 'anotherQuizName');
      expect(nameUpdate).toStrictEqual({ error: 'Name is already used' });
    });
  });

  describe('Success Cases', () => {
    let authUserId;
    let quizId;

    beforeEach(() => {
      authUserId = adminAuthRegister('email@gmail.com', '1password', 'firstname', 'lastname').authUserId;
      quizId = adminQuizCreate(authUserId, 'name', 'description').quizId;
    });

    test('Check that function returns empty object', () => {
      const name = adminQuizNameUpdate(authUserId, quizId, 'Name');
      expect(name).toStrictEqual({});
    });

    test('Check name has been updated successfully', () => {
      adminQuizNameUpdate(authUserId, quizId, 'newName');
      const updatedQuizInfo = adminQuizInfo(authUserId, quizId);
      expect(updatedQuizInfo).toStrictEqual({
        quizId: quizId,
        name: 'newName',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'description'
      });
    });

    test('Successfully Returned quizInfo after quizNameUpdate', () => {
      adminQuizNameUpdate(authUserId, quizId, 'newName');
      const updatedQuizInfo = adminQuizInfo(authUserId, quizId);

      expect(updatedQuizInfo).toStrictEqual(
        {
          quizId: quizId,
          name: 'newName',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'description'
        }
      );
    });
  });
});
