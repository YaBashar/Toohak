import request from 'sync-request-curl';
import { port, url } from './config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 1000;
import { adminQuizCreate } from '../src/quiz.js';
import { adminAuthRegister } from '../src/auth';
import { clear } from '../src/other.js';

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });
});

describe('POST /v1/admin/quiz', () => {
describe('Testing for adminQuizCreate', () => {
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
  
    id = adminAuthRegister('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
  });

  test('AuthUserId is invalid', () => {
    const result = adminQuizCreate('invalidAuthUserId', 'Sidak', 'valid description');
    expect(result).toStrictEqual({ error: 'Invalid User id' });
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
    const result = adminQuizCreate(id.authUserId, 'sid!ak', 'valid description');
    expect(result).toStrictEqual({ error: expect.any(String) });
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
    const result = adminQuizCreate(id.authUserId, 's', 'valid description');
    expect(result).toStrictEqual({ error: 'name is less than 3 characters' });
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
    const result = adminQuizCreate(id.authUserId, 'abcdefghijklmnopqrstuvwxyzabcde', 'valid description');
    expect(result).toStrictEqual({ error: 'name is more than 30 characters' });
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
    adminQuizCreate(id.authUserId, 'Sidak', 'valid description');
    const result = adminQuizCreate(id.authUserId, 'Sidak', 'description');
    expect(result).toStrictEqual({ error: expect.any(String) });
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
    const result = adminQuizCreate(id.authUserId, 'Sidak', longDescription);
    expect(result).toStrictEqual({ error: 'Description is more than 100 characters in length' });
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
    const result = adminQuizCreate(id.authUserId, 'john', 'toohak quiz');
    // quiz created successfully
    expect(result).toStrictEqual({ quizId: expect.any(Number) });
  });
});


/// //////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////
