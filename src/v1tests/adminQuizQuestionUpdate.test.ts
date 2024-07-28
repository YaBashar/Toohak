import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;
let quiz1Id: string;
let quiz2Id: string;
let question1Quiz1Id: string;
let question1Quiz2Id: string;
let randomToken: string;
let randomQuizId: string;

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
  const quiz1 = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name: 'quiz 1', description: 'the first quiz' }
  });
  quiz1Id = JSON.parse(quiz1.body.toString()).quizId;

  // add a question to the quiz
  const question1Quiz1 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question`, {
    json: {
      token,
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

  // create a second quiz
  const quiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name: 'quiz 2', description: 'the second quiz' }
  });
  quiz2Id = JSON.parse(quiz2.body.toString()).quizid;

  // add a question to the second quiz
  const question1Quiz2 = request('POST', SERVER_URL + `/v1/admin/quiz/${quiz2Id}/question`, {
    json: {
      token,
      questionBody: {
        question: 'What is 1 + 1?',
        duration: 4,
        points: 5,
        answers: [
          { answer: '4', correct: false },
          { answer: '2', correct: true },
          { answer: '11', correct: false }
        ]
      }
    }
  });
  question1Quiz2Id = JSON.parse(question1Quiz2.body.toString()).questionid;
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('PUT /v1/admin/quiz/:quizid/question/:questionid', () => {
  test('Question id does not exist', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${55}`, {
      json: {
        token,
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
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Question id does not exist in this quiz', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz2Id + 1}`, {
      json: {
        token,
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
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Question string is too short', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who?',
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
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Question string is too long', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the Monarch of England right now, in this moment, at this very second?',
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
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Question has too many answers', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            { answer: 'Prince William', correct: false },
            { answer: 'Prince Charles', correct: true },
            { answer: 'Prince Beckham', correct: false },
            { answer: 'Queen Victoria', correct: false },
            { answer: 'Queen Elizabeth', correct: false },
            { answer: "Queen Elizabeth's corgi", correct: false },
            { answer: 'Prince George', correct: false }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Question does not have enough answers', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            { answer: 'Prince Charles', correct: true }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Question duration is a string', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: '6',
          points: 5,
          answers: [
            { answer: 'Prince William', correct: false },
            { answer: 'Prince Charles', correct: true },
            { answer: 'Prince Beckham', correct: false }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Question duration is a negative number', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: -3,
          points: 5,
          answers: [
            { answer: 'Prince William', correct: false },
            { answer: 'Prince Charles', correct: true },
            { answer: 'Prince Beckham', correct: false }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Total question durations is too long', () => {
    request('POST', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question`, {
      json: {
        token,
        questionBody: {
          question: 'What is 1 + 1?',
          duration: 170,
          points: 5,
          answers: [
            { answer: '4', correct: false },
            { answer: '2', correct: true },
            { answer: '11', correct: false }
          ]
        }
      }
    });
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 15,
          points: 5,
          answers: [
            { answer: 'Prince William', correct: false },
            { answer: 'Prince Charles', correct: true },
            { answer: 'Prince Beckham', correct: false }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Points is a string', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: '5',
          answers: [
            { answer: 'Prince William', correct: false },
            { answer: 'Prince Charles', correct: true },
            { answer: 'Prince Beckham', correct: false }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Points is a negative number', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: -5,
          answers: [
            { answer: 'Prince William', correct: false },
            { answer: 'Prince Charles', correct: true },
            { answer: 'Prince Beckham', correct: false }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Too many points', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 15,
          answers: [
            { answer: 'Prince William', correct: false },
            { answer: 'Prince Charles', correct: true },
            { answer: 'Prince Beckham', correct: false }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Answer is too short', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 3,
          answers: [
            { answer: 'Prince William', correct: false },
            { answer: 'Prince Charles', correct: true },
            { answer: '', correct: false }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Answer is too long', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 3,
          answers: [
            { answer: 'Prince William', correct: false },
            { answer: 'Prince Charles', correct: true },
            { answer: 'Prince Beckham is the current reigning Monarch of England', correct: false }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('duplicate answer', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 3,
          answers: [
            { answer: 'Prince William', correct: false },
            { answer: 'Prince Charles', correct: true },
            { answer: 'Prince William', correct: false }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('no correct answer', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 3,
          answers: [
            { answer: 'Prince William', correct: false },
            { answer: 'Prince Charles', correct: false },
            { answer: 'Prince Beckham', correct: false }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('empty token', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token: '',
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
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  test('invalid token', () => {
    request('POST', SERVER_URL + '/v1/admin/auth/logout', { json: { token } });
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
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
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
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
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${randomQuizId}/question/${question1Quiz1Id}`, {
      json: {
        token: token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            { answer: 'Prince William', correct: false },
            { answer: 'Prince Charles', correct: true },
            { answer: 'Prince Charles', correct: false }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  test('this quiz does not exist', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${999}/question/${question1Quiz1Id}`, {
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
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  test('All fields are valid', () => {
    const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quiz1Id}/question/${question1Quiz1Id}`, {
      json: {
        token,
        questionBody: {
          question: 'Who is the ruler of England?',
          duration: 10,
          points: 2,
          answers: [
            { answer: 'Prince George', correct: false },
            { answer: 'Prince William', correct: false },
            { answer: 'Prince Charles', correct: true }
          ]
        }
      }
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
  });
});
