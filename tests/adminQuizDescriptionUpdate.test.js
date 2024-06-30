import { adminAuthRegister } from '../src/auth.js';
import { adminQuizDescriptionUpdate, adminQuizCreate, adminQuizInfo } from '../src/quiz.js';
import { clear } from '../src/other.js';

beforeEach(() => {
  clear();
});

describe('adminQuizDescriptionUpdate Tests', () => {
  describe('Error Cases', () => {
    let authUserId;
    let quizId;

    beforeEach(() => {
      authUserId = adminAuthRegister('email@gmail.com', '1password', 'firstname', 'lastname').authUserId;
      quizId = adminQuizCreate(authUserId, 'quizname', 'description').quizId;
    });

    // Test for checking if the individual accessing Tahook has a valid userId
    test('Invalid user Id type (authUserId: "one", quizId: 1, description: "Toohak Javascript Quiz 1")', () => {
      const result = adminQuizDescriptionUpdate('one', quizId, 'Toohak Javascript Quiz 1');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    // Test for checking if the individual accessing Tahook has a valid quizId
    test('Invalid quiz Id type (authUserId: 1, quizId: "one", description: "Toohak Javascript Quiz 1")', () => {
      const result = adminQuizDescriptionUpdate(authUserId, 'one', 'Toohak Javascript Quiz 1');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    // Test for checking if the quiz's description exceeds over 100 characters
    test('Description is more than 100 characters', () => {
      const longDescription = 'A'.repeat(101);
      const result = adminQuizDescriptionUpdate(authUserId, quizId, longDescription);
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    // Test for checking if quidId is non-existent within Tahook
    test('Non-existent quiz Id (authUserId: 1, quizId: 999, description: "Non-existent Quiz")', () => {
      const result = adminQuizDescriptionUpdate(authUserId, 999, 'Non-existent Quiz');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    // Test for checking if the quizId is owned by the user and uses a second user to test against for
    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const result = adminQuizDescriptionUpdate(authUserId + 1, quizId, 'Any description');
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

    // Test for checking if the user has provided a valid input for the quiz description
    test('Valid inputs (authUserId: 1, quizId: 1, description: "Toohak Javascript Quiz 1")', () => {
      adminQuizDescriptionUpdate(authUserId, quizId, 'Toohak Javascript Quiz 1');
      const result = adminQuizInfo(authUserId, quizId);

      expect(result).toStrictEqual({
        quizId: quizId,
        name: 'quizname',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Toohak Javascript Quiz 1',
      });
    });

    // Test for checking if the user with a different quiId has provided a valid input for the quiz description
    test('Valid inputs (authUserId: 1, quizId: 2, description: "QUIZ 1")', () => {
      adminQuizDescriptionUpdate(authUserId, quizId, 'QUIZ 1');
      const result = adminQuizInfo(authUserId, quizId);

      expect(result).toStrictEqual({
        quizId: quizId,
        name: 'quizname',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'QUIZ 1',
      });
    });

    // Test for checking if the quiz description is around 100 characters
    test('Description is exactly 100 characters', () => {
      const longDescription = 'A'.repeat(100);
      adminQuizDescriptionUpdate(authUserId, quizId, longDescription);
      const result = adminQuizInfo(authUserId, quizId);

      expect(result).toStrictEqual({
        quizId: quizId,
        name: 'quizname',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: longDescription,
      });
    });

    // Test for checking if the quiz description is around 99 characters
    test('Description is exactly 99 characters', () => {
      const description = 'A'.repeat(99);
      adminQuizDescriptionUpdate(authUserId, quizId, description);
      const result = adminQuizInfo(authUserId, quizId);

      expect(result).toStrictEqual({
        quizId: quizId,
        name: 'quizname',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: description,
      });
    });
  });
});
