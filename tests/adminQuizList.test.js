import { adminQuizList, adminQuizCreate } from '../src/quiz.js'
import { adminAuthRegister } from '../src/auth.js'
import { clear } from '../src/other.js'

beforeEach(() => {
  clear();
  let id = adminAuthRegister('amelia@unsw.edu.au', 'ABCDabcd1234!@#$', 'Amelia', 'Su').authUserId;
  console.log(id);
  let quiz = adminQuizCreate(id, 'quiz 1', 'the first quiz');
  let quiz2 = adminQuizCreate(id, 'quiz 1', 'the first quiz');
});

describe('Testing for errors', () => {
  // AuthUserId isn't valid
  test('Invalid AuthUserId', () => {
    const result1 = adminQuizList('randomstring');
    expect(result1).toStrictEqual({error: 'invalid user id'});

    const result2 = adminQuizList('1');
    expect(result2).toStrictEqual({error: 'invalid user id'});
  });

  test.only('Expected results', () => {
    const result3 = adminQuizList(id);
    expect(result3).toStrictEqual(
      { quizzes: [
        {
          quizId,
          name,
        }
      ]
    })
  });
});