import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;
let quiz1Id: string;
let question1Quiz1Id: string;
let randomToken: string;
let randomQuizId: string;
let quiz1;

// wrapper functions
const createUser = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }
  });
  return JSON.parse(res.body.toString());
}

const userLogin = (email: string, password: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: { email, password }
  });
  return JSON.parse(res.body.toString());
}

const createQuiz = (token: string, name: string, description: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description }
  });
  return JSON.parse(res.body.toString());
}

const addQuestion = (token: string, quizid: string, question: string, duration: number, points: number, answers: object) => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz/${quizid}/question', {
    json: {
      token,
      questionBody: {
        question,
        duration,
        points,
        answers
      }
    }
  });
  return JSON.parse(res.body.toString());
}

const moveQuestion = (token: string, quizid: string, questionid: string, newPosition: number) => {
  const res = request('PUT', SERVER_URL + '/v1/admin/quiz/${quizid}/question/${questionid}/move', {
    json: {
      token,
      newPosition
    }
  });
  return JSON.parse(res.body.toString());
}


beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });

  // create account and log in
  const user = createUser('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su')
  token = user.token;
  userLogin('amelia@unsw.edu.au', 'abcd1234!@#$ABCD')

  // create a quiz
  quiz1 = createQuiz(token, 'quiz 1', 'the first quiz')
  quiz1Id = quiz1.quizId;

  // add a question to the quiz1
  const question1Quiz1 = addQuestion(token, quiz1Id, 'Who is the Monarch of England?', 4, 5,
  [
    { answer: 'Prince William', correct: false },
    { answer: 'Prince Charles', correct: true },
    { answer: 'Prince Beckham', correct: false }
  ])
  question1Quiz1Id = question1Quiz1.questionId;

  // add another question to quiz1
  addQuestion(token, quiz1Id, 'What is 10 - 7?', 4, 5,
  [
    { answer: '2', correct: false },
    { answer: '3', correct: true },
    { answer: '17', correct: false }
  ])
});

describe('PUT /v1/admin/quiz/:quizid/question/:questionid/move', () => {
  test('Question id does not exist', () => {
    const res = moveQuestion(token, quiz1Id, '55', 2)
    expect(res).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('New position is less than 0', () => {
    const res = moveQuestion(token, quiz1Id, question1Quiz1Id, -2)
    expect(res).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('New position is too big', () => {
    const res = moveQuestion(token, quiz1Id, question1Quiz1Id, 5)
    expect(res).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('New position is current position', () => {
    const res = moveQuestion(token, quiz1Id, question1Quiz1Id, 0)
    expect(res).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('empty token', () => {
    const res = moveQuestion('', quiz1Id, question1Quiz1Id, 2)
    expect(res).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  test('invalid token', () => {
    request('POST', SERVER_URL + '/v1/admin/auth/logout', { json: { token } });
    const res = moveQuestion(token, quiz1Id, question1Quiz1Id, 2)
    expect(res).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  // Valid token is provided, but user is not an owner of this quiz or quiz doesn't exist
  test('user is not an owner of this quiz', () => {
    const user = createUser('random@unsw.edu.au', 'abcd1234!@#$ABC', 'ran', 'dom')
    randomToken = user.token;
    userLogin('random@unsw.edu.au', 'abcd1234!@#$ABC')
    const randomQuiz = createQuiz(randomToken, 'random quiz', 'a random quiz')
    randomQuizId = randomQuiz.quizid;
    request('POST', SERVER_URL + '/v1/admin/auth/logout', { json: { email: 'random@unsw.edu.au', password: 'abcd1234!@#$ABC' } });
    userLogin('amelia@unsw.edu.au', 'abcd1234!@#$ABCD')
    const res = moveQuestion(token, randomQuizId, question1Quiz1Id, 2)
    expect(res).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  test('this quiz does not exist', () => {
    const res = moveQuestion(token, '999', question1Quiz1Id, 2)
    expect(res).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  test('All fields are valid', () => {
    const res = moveQuestion(token, quiz1Id, question1Quiz1Id, 1)
    expect(res).toStrictEqual({});
    expect(res.statusCode).toBe(200);
  });
});
