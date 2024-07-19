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

// wrapper functions
const createUser = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }
  });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

const userLogin = (email: string, password: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: { email, password }
  });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

const createQuiz = (token: string, name: string, description: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description }
  });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

const addQuestion = (token: string, quizId: string, question: string, duration: number, points: number, answers: object) => {
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/question`, {
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
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

const updateQuestion = (token: string, quizid: string, questionid: string, question: string, duration: number, points: number, answers: object) => {
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizid}/question/${questionid}`, {
    json: {
      token,
      questionBody: {
        question,
        duration,
        points,
        answers
      }
    }
  })
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

const quizInfo = (token: string, quizid: string) => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/${quizid}', {
    qs: { token, quizid }
  });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

const quizList = (token: string) => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
    qs: { token }
  });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}


beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });

  // create account and log in
  createUser('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su')
  const user = userLogin('amelia@unsw.edu.au', 'abcd1234!@#$ABCD')
  token = user.body.token;

  // create a quiz
  quiz1Id = createQuiz(token, 'quiz 1', 'the first quiz').body.quizId

  // add a question to the quiz
  question1Quiz1Id = addQuestion(token, quiz1Id, 'Who is the Monarch of England?', 4, 5, 
  [
    { answer: 'Prince William', correct: false },
    { answer: 'Prince Charles', correct: true },
    { answer: 'Prince Beckham', correct: false }
  ]).body.questionId;

  // create a second quiz
  quiz2Id = createQuiz(token, 'quiz 2', 'the second quiz').body.quizId

  // add a question to the second quiz
  question1Quiz2Id = addQuestion(token, quiz2Id, 'What is 1 + 1?', 4, 5,
  [
    { answer: '4', correct: false },
    { answer: '2', correct: true },
    { answer: '11', correct: false }
  ]).body.questionId;
  const quiz1 = quizInfo(token, quiz1Id)
    //console.log(quiz1.body);
});

describe('PUT /v1/admin/quiz/:quizid/question/:questionid', () => {
  test('Question id does not exist', () => {
    const res = updateQuestion(token, quiz1Id, '55', 'Who is the Monarch of England?', 4, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    const quizzes = quizList(token);
    console.log(quiz1Id);
    console.log(quizzes.body);
    expect(res.statusCode).toBe(400);
  });

  test('Question id does not exist in this quiz', () => {
    const res = updateQuestion(token, quiz1Id, question1Quiz2Id, 'Who is the Monarch of England?', 4, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
  });

  test('Question string is too short', () => {
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id, 'Who?', 4, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
  });

  test('Question string is too long', () => {
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id, 'Who is the Monarch of England right now, in this moment, at this very second?', 4, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
  });

  test('Question has too many answers', () => {
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id, 'Who is the Monarch of England?', 4, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false },
      { answer: 'Queen Victoria', correct: false },
      { answer: 'Queen Elizabeth', correct: false },
      { answer: "Queen Elizabeth's corgi", correct: false },
      { answer: 'Prince George', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
  });

  test('Question does not have enough answers', () => {
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id, 'Who is the Monarch of England?', 4, 5,
    [
      { answer: 'Prince Charles', correct: true }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Question duration is a negative number', () => {
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id, 'Who is the Monarch of England?', -3, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
  });

  test('Total question durations is too long', () => {
    addQuestion(token, quiz1Id, 'What is 1 + 1?', 170, 5,
    [
      { answer: '4', correct: false },
      { answer: '2', correct: true },
      { answer: '11', correct: false }
    ])
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id, 'Who is the Monarch of England?', 15, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
  });

  test('Points is a negative number', () => {
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id,'Who is the Monarch of England?', 4, -5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ] )
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
  });

  test('Too many points', () => {
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id, 'Who is the Monarch of England?', 4, 15,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
  });

  test('Answer is too short', () => {
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id, 'Who is the Monarch of England?', 4, 3,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: '', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
  });

  test('Answer is too long', () => {
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id, 'Who is the Monarch of England?', 4, 3,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham is the current reigning Monarch of England', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
  });

  test('duplicate answer', () => {
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id, 'Who is the Monarch of England?', 4, 3,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince William', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
  });

  test('no correct answer', () => {
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id, 'Who is the Monarch of England?', 4, 3,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: false },
      { answer: 'Prince Beckham', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(400);
  });

  test('empty token', () => {
    const res = updateQuestion('', quiz1Id, question1Quiz1Id, 'Who is the Monarch of England?', 4, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(401);
  });

  test('invalid token', () => {
    request('POST', SERVER_URL + '/v1/admin/auth/logout', { json: { token } });
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id, 'Who is the Monarch of England?', 4, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(401);
  });

  // Valid token is provided, but user is not an owner of this quiz or quiz doesn't exist
  test('user is not an owner of this quiz', () => {
    const random = createUser('random@unsw.edu.au', 'abcd1234!@#$ABC', 'ran', 'dom')
    randomToken = random.body.token;
    userLogin('random@unsw.edu.au', 'abcd1234!@#$ABC')
    const randomQuiz = createQuiz(randomToken, 'random quiz', 'a random quiz')
    randomQuizId = randomQuiz.body.quizid;
    request('POST', SERVER_URL + '/v1/admin/auth/logout', { json: { email: 'random@unsw.edu.au', password: 'abcd1234!@#$ABC' } });
    userLogin('amelia@unsw.edu.au', 'abcd1234!@#$ABCD')
    const res = updateQuestion(token, randomQuizId, question1Quiz1Id, 'Who is the Monarch of England?', 4, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Charles', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(403);
  });

  test('this quiz does not exist', () => {
    const res = updateQuestion(token, '999', question1Quiz1Id, 'Who is the Monarch of England?', 4, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ])
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    console.log(res.body);
    expect(res.statusCode).toBe(403);
  });

  test('All fields are valid', () => {
    const res = updateQuestion(token, quiz1Id, question1Quiz1Id, 'Who is the ruler of England?', 10, 2,
    [
      { answer: 'Prince George', correct: false },
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true }
    ])
    expect(res.statusCode).toBe(200);
    console.log(res.body);
    expect(res.body).toStrictEqual({});
  });
});
