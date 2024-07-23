import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// wrapper functions
const createQuiz = (token : string, name : string, description : string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description }
  });
  return JSON.parse(res.body.toString());
};

const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  return request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst: firstName, nameLast: lastName }
  });
};

const questionCreate = (token: string, quizid: number, question: string, duration: number, points: number, answers: object, thumbnailUrl: string) => {
  return request('POST', SERVER_URL + `/v2/admin/quiz/${quizid}/question`, {
    headers: {
      token,
    },
    json: {
      questionBody: {
        question,
        duration,
        points,
        answers,
        thumbnailUrl
      }
    }
  });
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('POST /v2/admin/quiz/:quizid/question', () => {
  let quizid: number;
  let quizid2: number;
  let token1: string;
  let token2: string;

  beforeEach(() => {
    const uid1 = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
    token1 = JSON.parse(uid1.body.toString()).token;
    quizid = createQuiz(token1, 'quizName', 'description').quizId;

    const uid2 = createUser('z5555555@unsw.edu.au', 'abs@#$234', 'brim', 'johnson');
    token2 = JSON.parse(uid2.body.toString()).token;
    quizid2 = createQuiz(token2, 'quizName2', 'description').quizId;
  });

  // Token is empty or invalid (does not refer to valid logged in user session)
  test('Token is invalid (does not refer to valid logged in user session)', () => {
    const res = questionCreate('invalidToken', quizid, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
    "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  // token is empty
  test('Token is empty', () => {
    const res = questionCreate('', quizid, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
    "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  // Question string is less than 5 characters
  test('Question string is less than 5 characters', () => {
    const res = questionCreate(token1, quizid, 'Who', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // Question string is greater than 50 characters in length
  test('Question string is greater than 50 characters in length', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England? Who is the Monarch of England? Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The question has more than 6 answers
  test('The question has more than 6 answers', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 4, 5, [
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
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The question has less than 2 answers
  test('The question has less than 2 answers', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The question duration is not a positive number
  test('The question duration is not a positive number', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', -4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The question duration is 0
  test('The question duration is 0', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 0, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The sum of the question durations in the quiz exceeds 3 minutes
  test('The sum of the question durations in the quiz exceeds 3 minutes', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 190, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });
 
  // The points awarded for the question are less than 1
  test('The points awarded for the question are less than 1', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 4, 0, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The points awarded for the question are greater than 10
  test('The points awarded for the question are greater than 10', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 4, 11, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The length of any answer is shorter than 1 character long
  test('The length of any answer is shorter than 1 character long', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'hello',
        correct: false,
      },
      {
        answer: '',
        correct: true,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The length of any answer is longer than 30 characters long
  test('The length of any answer is longer than 30 characters long', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles Prince Charles Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth Queen Elizabeth Queen Elizabeth',
        correct: false,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // Any answer strings are duplicates of one another (within the same question)
  test('Any answer strings are duplicates of one another (within the same question)', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Prince Charles',
        correct: false,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // No answer is marked correct
  test('No answer is marked correct', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: false,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // test to check quiz id does not refer to a valid quiz
  test('Quiz Id does not refer to a valid quiz', () => {
    const res = questionCreate(token1, quizid + 1, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  // The provided quizid does not belong to the user
  test('The provided quizid does not belong to the user', () => {
    const res = questionCreate(token1, quizid2, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
      "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  // thumbnailUrl is an empty string
  test('ThumbnailUrl is an empty string', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
      ""
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The thumbnailUrl does not end with one of the following filetypes (case insensitive): jpg, jpeg, png
  // with gif
  test('The thumbnailUrl does not end with one of the following filetypes (case insensitive): jpg, jpeg, png', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
      "http://google.com/some/image/path.gif"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The thumbnailUrl does not end with one of the following filetypes (case insensitive): jpg, jpeg, png
  // with doc
  test('The thumbnailUrl does not end with one of the following filetypes (case insensitive): jpg, jpeg, png', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
      "http://google.com/some/image/path.doc"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // The thumbnailUrl does not begin with 'http://' or 'https://'
  test('The thumbnailUrl does not begin with http:// or https://', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
      "google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // Valid input
  test('Valid input', () => {
    const res = questionCreate(token1, quizid, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
    "http://google.com/some/image/path.jpg"
    );
    expect(JSON.parse(res.body.toString())).toStrictEqual({ questionId: expect.any(Number) });
    expect(res.statusCode).toBe(200);
  });
});
