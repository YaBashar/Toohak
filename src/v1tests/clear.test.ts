import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('clear Function Tests', () => {
  describe('Success Cases', () => {
    test('Clear function should return an empty object', () => {
      const response = request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
      const result = JSON.parse(response.body.toString());
      expect(result).toEqual({});
      expect(response.statusCode).toBe(200);
    });

    test.each([
      ['first call'],
      ['second call'],
      ['third call']
    ])('Clear function should return an empty object on %s', (callEmpty) => {
      const response = request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
      const result = JSON.parse(response.body.toString());
      expect(result).toEqual({});
      expect(response.statusCode).toBe(200);
    });

    test('Clear function should not throw errors when called multiple times', () => {
      expect(() => request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS })).not.toThrow();
      expect(() => request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS })).not.toThrow();
      expect(() => request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS })).not.toThrow();
    });
  });

  describe('Error Case', () => {
    test('Clear function should handle undefined or null input', () => {
      const response = request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
      const result = JSON.parse(response.body.toString());
      expect(result).toEqual({});
      expect(response.statusCode).toBe(200);

      const anotherResponse = request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
      const anotherResult = JSON.parse(anotherResponse.body.toString());
      expect(anotherResult).toEqual({});
      expect(anotherResponse.statusCode).toBe(200);
    });
  });
});
