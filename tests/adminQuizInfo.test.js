import { adminAuthRegister } from '../src/auth.js';
import { adminQuizInfo, adminQuizCreate, adminQuizNameUpdate } from '../src/quiz.js';
import { clear } from '../src/other.js';

beforeEach(() => {
  clear();
});

describe('adminQuizInfo Tests', () => {
  describe('Error Cases', () => {
    let authUserId;
    let quizId;

    beforeEach(() => {
      authUserId = adminAuthRegister('email@gmail.com', '1password', 'firstname', 'lastname').authUserId;
      quizId = adminQuizCreate(authUserId, 'quizname', 'description').quizId;
    });

    test('Info of a Quiz which does not exist ', () => {
      const quizInfo = adminQuizInfo(authUserId, quizId + 1);
      expect(quizInfo).toStrictEqual({ error: expect.any(String) });
    });

    test('Info of a Quiz with invalid Authuser id', () => {
      const quizInfo = adminQuizInfo(authUserId + 1, quizId);
      expect(quizInfo).toStrictEqual({ error: expect.any(String) });
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const result = adminQuizInfo(authUserId + 1, quizId, 'Any description');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('Success Cases', () => {
    let authUserId;
    let quizId;

    beforeEach(() => {
      authUserId = adminAuthRegister('email@gmail.com', '1password', 'firstname', 'lastname').authUserId;
      quizId = adminQuizCreate(authUserId, 'quizname', 'description').quizId;
    });

    test('Successfully Returned quizInfo', () => {
      const quizInfo = adminQuizInfo(authUserId, quizId);

      expect(quizInfo).toStrictEqual(
        {
          quizId: quizId,
          name: 'quizname',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'description'
        }
      );
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
