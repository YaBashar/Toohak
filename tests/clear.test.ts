import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  const response = request('DELETE', SERVER_URL + '/v1/clear');
});

describe('clear Function Tests', () => {
  describe('Success Cases', () => {
    test('Clear function should return an empty object', () => {
      const response = request('DELETE', SERVER_URL + '/v1/clear');
      const result = JSON.parse(response.body.toString());
      expect(result).toEqual({});
      expect(response.statusCode).toBe(200);
    });

    test.each([
      ['first call'],
      ['second call'],
      ['third call']
    ])('Clear function should return an empty object on %s', (callEmpty) => {
      const response = request('DELETE', SERVER_URL + '/v1/clear');
      const result = JSON.parse(response.body.toString());
      expect(result).toEqual({});
      expect(response.statusCode).toBe(200);
    });

    test('Clear function should not throw errors when called multiple times', () => {
      expect(() => request('DELETE', SERVER_URL + '/v1/clear')).not.toThrow();
      expect(() => request('DELETE', SERVER_URL + '/v1/clear')).not.toThrow();
      expect(() => request('DELETE', SERVER_URL + '/v1/clear')).not.toThrow();
    });
  });

  describe('Error Case', () => {
    test('Clear function should handle undefined or null input', () => {
      let response = request('DELETE', SERVER_URL + '/v1/clear');
      let result = JSON.parse(response.body.toString());
      expect(result).toEqual({});
      expect(response.statusCode).toBe(200);

      response = request('DELETE', SERVER_URL + '/v1/clear');
      result = JSON.parse(response.body.toString());
      expect(result).toEqual({});
      expect(response.statusCode).toBe(200);
    });
  });
});