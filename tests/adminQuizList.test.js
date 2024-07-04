import { adminQuizList, adminQuizCreate } from '../src/quiz.js';
import { adminAuthRegister } from '../src/auth.js';
import { clear } from '../src/other.js';

beforeEach(() => {
  clear();
});

describe('Testing for errors', () => {
  // AuthUserId isn't valid
  test('Invalid AuthUserId', () => {
    const result1 = adminQuizList('randomstring');
    expect(result1).toStrictEqual({ error: 'invalid user id' });

    const result2 = adminQuizList('1');
    expect(result2).toStrictEqual({ error: 'invalid user id' });
  });

  test('Expected results', () => {
    const id = adminAuthRegister('amelia@unsw.edu.au', 'ABCDabcd1234!@#$', 'Amelia', 'Su').authUserId;
    const quiz = adminQuizCreate(id, 'quiz 1', 'the first quiz').quizId;
    const quiz2 = adminQuizCreate(id, 'quiz 2', 'the second quiz').quizId;
    const result3 = adminQuizList(id);
    expect(result3).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz,
            name: 'quiz 1'
          },
          {
            quizId: quiz2,
            name: 'quiz 2'
          }
        ]
      });
  });
});
