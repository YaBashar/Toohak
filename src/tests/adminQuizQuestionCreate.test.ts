import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

interface Answer {
  answer: string,
  correct: boolean
}

interface Question {
  question: string,
  duration: number,
  points: number,
  answers: Answer[]
}

/// ////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('POST /v1/admin/quiz/:quizid/question', () => {
  let quizid: number, quizid2: number, token1: string, token2: string;

  beforeEach(() => {
    token1 = requestAuthRegister('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
    quizid = createQuiz(token1, 'quizName', 'description').quizId;

    token2 = requestAuthRegister('z5555555@unsw.edu.au', 'abs@#$234', 'brim', 'johnson');
    quizid2 = createQuiz(token2, 'quizName2', 'description').quizid;
  });

  // Token is empty or invalid (does not refer to valid logged in user session)
  test('Token is invalid (does not refer to valid logged in user session)', () => {
    const res = createQuestion(quizid, 'invalid token', {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }]
    });

    const data = (JSON.parse(res.body.toString()));

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  // token is empty
  test('Token is empty', () => {
    const res = createQuestion(quizid, '', {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }]
    });

    const data = (JSON.parse(res.body.toString()));

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  // Question string is less than 5 characters
  test('Question string is less than 5 characters', () => {
    const res = createQuestion(quizid, token1, {
      question: 'Who',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }]
    });

    const data = (JSON.parse(res.body.toString()));

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // Question string is greater than 50 characters in length
  test('Question string is greater than 50 characters in length', () => {
    const res = createQuestion(quizid, token1, {
      question: 'Who is the Monarch of England? Who is the Monarch of England? Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }]
    });

    const data = (JSON.parse(res.body.toString()));

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The question has more than 6 answers
  test('The question has more than 6 answers', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
      json: {
        token: token1,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            },
            {
              answer: 'Prince William',
              correct: false,
            },
            {
              answer: 'Prince Harry',
              correct: false,
            },
            {
              answer: 'Prince Philip',
              correct: false,
            },
            {
              answer: 'Prince Andrew',
              correct: false,
            },
            {
              answer: 'Prince Edward',
              correct: false,
            }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The question has less than 2 answers
  test('The question has less than 2 answers', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
      json: {
        token: token1,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The question duration is not a positive number
  test('The question duration is not a positive number', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
      json: {
        token: token1,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: -4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The sum of the question durations in the quiz exceeds 3 minutes
  test('The sum of the question durations in the quiz exceeds 3 minutes', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
      json: {
        token: token1,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 190,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The points awarded for the question are less than 1
  test('The points awarded for the question are less than 1', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
      json: {
        token: token1,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 0,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The points awarded for the question are greater than 10
  test('The points awarded for the question are greater than 10', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
      json: {
        token: token1,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 11,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The length of any answer is shorter than 1 character long
  test('The length of any answer is shorter than 1 character long', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
      json: {
        token: token1,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'hello',
              correct: false,
            },
            {
              answer: '',
              correct: true,
            }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The length of any answer is longer than 30 characters long
  test('The length of any answer is longer than 30 characters long', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
      json: {
        token: token1,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles Prince Charles Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth Queen Elizabeth Queen Elizabeth',
              correct: false,
            }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // Any answer strings are duplicates of one another (within the same question)
  test('Any answer strings are duplicates of one another (within the same question)', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
      json: {
        token: token1,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Prince Charles',
              correct: false,
            }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // There are no correct answers
  test('There are no correct answers', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
      json: {
        token: token1,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: false,
            },
            {
              answer: 'Prince',
              correct: false,
            }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // test to check quiz Id does not refer to a valid quiz
  test('Quiz Id does not refer to a valid quiz', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid2 + 1}/question`, {
      json: {
        token: token1,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  // test to check if quiz ID does not refer to a quiz that this user owns
  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid2}/question`, {
      json: {
        token: token1,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: true,
            },
            {
              answer: 'Queen Elizabeth',
              correct: false,
            }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  // quiz question created successfully
  test('Quiz question created successfully', () => {
    const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
      json: {
        token: token1,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: false,
            },
            {
              answer: 'Prince is not Charles',
              correct: true,
            },
            {
              answer: 'Prince is Beckham',
              correct: false,
            }
          ]
        }
      }
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ questionId: expect.any(Number) });
    expect(res.statusCode).toBe(200);
  });
});

// HELPER FUNCTIONS
const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const id = (request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }, timeout: TIMEOUT_MS
  }));

  return JSON.parse(id.body.toString()).token;
};

const createQuiz = (token : string, name : string, description : string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description }, timeout: TIMEOUT_MS
  });
  return JSON.parse(res.body.toString());
};

const createQuestion = (quizid: number, token: string, body: Question) => {
  return (request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
    json: { token: token, questionBody: body }, timeout: TIMEOUT_MS
  }));
};
