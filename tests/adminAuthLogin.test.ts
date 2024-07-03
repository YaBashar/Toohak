import request from 'sync-request-curl';
import { port, url } from '../src/config.json'

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;


beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

///////////////////////////////////////////////////////////////////////////////

describe('Testing login error cases', () => {

  beforeEach(() => {
    requestAuthRegister('zid@unsw.edu.au', 'abcd1234', 'first', 'last');
  })

  // Email address does not exist.
  test('Email address does not exist', () => {
    const res = requestAuthLogin('zid2@unsw.edu.au', 'abcd1234');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({error: 'Email address does not exist' });
    expect(res.statusCode).toStrictEqual(400);
  });

  // Password is not correct for the given email.
  test('Incorrect password', () => {
    const res = requestAuthLogin('zidl@unsw.edu.au', 'abcd123');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({error: 'Incorrect password' });
    expect(res.statusCode).toStrictEqual(400);
  });

});

describe('Testing login success cases', () => {
  // Successful Login return type
  // updating the successful login count
  // updating the number of failed logins count
  // testing return type
});

const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/register', { 
    json: {email, password, nameFirst, nameLast}, timeout: TIMEOUT_MS
  }));
}

const requestAuthLogin = (email: string, password: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: {email, password}, timeout: TIMEOUT_MS
  }));
}
