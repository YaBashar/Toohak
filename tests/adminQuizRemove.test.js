import { adminQuizCreate, adminQuizList, adminQuizRemove } from '../src/quiz.js';
import { adminAuthRegister } from '../src/auth.js';
import { clear } from '../src/other.js';

beforeEach(() => {
  clear();
});

describe('Testing for adminQuizRemove function', () => {
  let uid, u2id, qid, q2id;

  beforeEach(() => {
    uid = adminAuthRegister('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
    qid = adminQuizCreate(uid.authUserId, 'validQuiz', 'valid description');
    u2id = adminAuthRegister('z5555555@unsw.edu.au', 'abs@#$234', 'brim', 'Johnson');
    q2id = adminQuizCreate(uid.authUserId, 'validQuiz2', 'valid description2');
  });

  // test to check if the authUserId is invalid
  test('AuthUserId is invalid', () => {
    const result = adminQuizCreate('invalidAuthUserId', 'Sidak', 'valid description');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  // test to check quiz Id does not refer to a valid quiz
  test('Quiz Id does not refer to a valid quiz', () => {
    const invalidQuizId = 'invalidQuizId';
    const result = adminQuizRemove(uid.authUserId, invalidQuizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  // test to check if quiz ID does not refer to a quiz that this user owns
  test('Quiz ID does not refer to a quiz that this user owns ', () => {
    const result = adminQuizRemove(u2id.authUserId, qid.quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  // write a test to check if the quiz is removed from the list of quizzes
  test('Quiz is removed from the list of quizzes', () => {
    adminQuizRemove(uid.authUserId, qid.quizId);
    const result = adminQuizList(uid.authUserId);

    expect(result).toStrictEqual({
      quizzes: [
        {
          quizId: q2id.quizId,
          name: 'validQuiz2',
        }
      ]
    });
  });
});
