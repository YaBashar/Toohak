import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;
let quiz1Id: string;
let question1Quiz1Id: string;
let randomToken: string;
let randomQuizId: string;
let quiz1;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });

  // create account and log in
  const user = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email: 'amelia@unsw.edu.au', password: 'abcd1234!@#$ABCD', nameFirst: 'amelia', nameLast: 'su' }
  });
  token = JSON.parse(user.body.toString()).token;
  request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: { email: 'amelia@unsw.edu.au', password: 'abcd1234!@#$ABCD' }
  });

  // create a quiz
  quiz1 = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name: 'quiz 1', description: 'the first quiz' }
  });
  quiz1Id = JSON.parse(quiz1.body.toString()).quizId;

  // add a question to the quiz1
  const question1Quiz1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question`, {
    json: {
      token: token,
      questionBody: {
        question: 'Who is the Monarch of England?',
        duration: 4,
        points: 5,
        answers: [
          { answer: 'Prince William', correct: false },
          { answer: 'Prince Charles', correct: true },
          { answer: 'Prince Beckham', correct: false }
        ]
      }
    }
  });
  question1Quiz1Id = JSON.parse(question1Quiz1.body.toString()).questionId;

  // add another question to quiz1
  request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question`, {
    json: {
      token: token,
      questionBody: {
        question: 'What is 10 - 7?',
        duration: 4,
        points: 5,
        answers: [
          { answer: '2', correct: false },
          { answer: '3', correct: true },
          { answer: '17', correct: false }
        ]
      }
    }
  });
});

describe('PUT /v1/admin/quiz/:quizid/question/:questionid/move', () => {
  test('Question id does not exist', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${55}/move`, {
      json: {
        token,
        newPosition: 2
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'question id does not exist in this quiz' });
    expect(res.statusCode).toBe(400);
  });

  test('Question id does not exist', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${55}/move`, {
      json: {
        token,
        newPosition: 2
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'question id does not exist in this quiz' });
    expect(res.statusCode).toBe(400);
  });

  test('New position is less than 0', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}/move`, {
      json: {
        token,
        newPosition: -2
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'position value is less than zero' });
    expect(res.statusCode).toBe(400);
  });

  test('New position is too big', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}/move`, {
      json: {
        token,
        newPosition: 5
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'new position is too big' });
    expect(res.statusCode).toBe(400);
  });

  test('New position is current position', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}/move`, {
      json: {
        token,
        newPosition: 0
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'new position is current position' });
    expect(res.statusCode).toBe(400);
  });

  test('empty token', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}/move`, {
      json: {
        token: '',
        newPosition: 2
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'invalid token' });
    expect(res.statusCode).toBe(401);
  });

  test('invalid token', () => {
    request('POST', SERVER_URL + '/v1/admin/auth/logout', { json: { token } });
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}/move`, {
      json: {
        token: token,
        newPosition: 2
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'invalid token' });
    expect(res.statusCode).toBe(401);
  });

  // Valid token is provided, but user is not an owner of this quiz or quiz doesn't exist
  test('user is not an owner of this quiz', () => {
    const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'random@unsw.edu.au', password: 'abcd1234!@#$ABC', nameFirst: 'ran', nameLast: 'dom' } });
    randomToken = JSON.parse(user.body.toString()).token;
    request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email: 'random@unsw.edu.au', password: 'abcd1234!@#$ABC' } });

    const randomQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { randomToken, name: 'random quiz', description: 'a random quiz' } });
    randomQuizId = JSON.parse(randomQuiz.body.toString()).quizid;
    request('POST', SERVER_URL + '/v1/admin/auth/logout', { json: { email: 'random@unsw.edu.au', password: 'abcd1234!@#$ABC' } });

    request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email: 'amelia@unsw.edu.au', password: 'abcd1234!@#$ABCD' } });
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${randomQuizId}/question/${question1Quiz1Id}/move`, {
      json: {
        token: token,
        newPosition: 2
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'quiz does not exist for this user' });
    expect(res.statusCode).toBe(403);
  });

  test('this quiz does not exist', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${999}/question/${question1Quiz1Id}/move`, {
      json: {
        token: token,
        newPosition: 2
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'quiz does not exist for this user' });
    expect(res.statusCode).toBe(403);
  });

  test('All fields are valid', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}/move`, {
      json: {
        token,
        newPosition: 1
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
    expect(res.statusCode).toBe(200);
  });
});
