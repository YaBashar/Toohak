import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });
});

describe('POST /v1/admin/quiz', () => {
  let id;
  beforeEach(() => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: 'z5525050@unsw.edu.au',
      password: '123ABCabc@#$',
      firstName: 'sidak',
      lastName: 'singh'
    },
    timeout: TIMEOUT_MS
  });
  const body = JSON.parse(res.body.toString());
  id = body.id;
});

  test('AuthUserId is invalid', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        authUserId: 'invalidAuthUserId',
        name: 'Sidak',
        description: 'valid description'
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Invalid User id' });
    expect(res.statusCode).toBe(400);
  });
  
  test('Name contains invalid characters', () => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '{', '}', '[', ']', 
                          ':', ';', '-', '"', "'", '<', '>', '.', '?', '/', '|', '\\'];
    const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        authUserId: id,
        name: 'sid!ak',
        description: 'valid description'
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
});

  test('Name is too short', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        authUserId: id,
        name: 's',
        description: 'valid description'
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'name is less than 3 characters' });
    expect(res.statusCode).toBe(400);
  });
  
  test('Name is too long', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        authUserId: id,
        name: 'abcdefghijklmnopqrstuvwxyzabcde',
        description: 'valid description'
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'name is more than 30 characters' });
    expect(res.statusCode).toBe(400);
  });
  
  test('Name is already used by current logged in user', () => {
    request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        authUserId: id,
        name: 'Sidak',
        description: 'valid description'
      },
      timeout: TIMEOUT_MS
    });
    const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        authUserId: id,
        name: 'Sidak',
        description: 'description'
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });
  
  test('Description is more than 100 characters', () => {
    const longDescription = 'a'.repeat(101);
    const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        authUserId: id,
        name: 'Sidak',
        description: longDescription
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Description is more than 100 characters in length' });
    expect(res.statusCode).toBe(400);
  });

  test('Quiz created successfully', () => {
    const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
      json: {
        authUserId: id,
        name: 'John',
        description: 'toohak quiz'
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ quizId: expect.any(Number) });
    expect(res.statusCode).toBe(200);
  });
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
