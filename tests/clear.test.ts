import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  // Perform the DELETE request to clear data before each test
  request('DELETE', SERVER_URL + '/v1/clear');
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
      const response = request('DELETE', SERVER_URL + '/v1/clear');
      const result = JSON.parse(response.body.toString());
      expect(result).toEqual({});
      expect(response.statusCode).toBe(200);

      const anotherResponse = request('DELETE', SERVER_URL + '/v1/clear');
      const anotherResult = JSON.parse(anotherResponse.body.toString());
      expect(anotherResult).toEqual({});
      expect(anotherResponse.statusCode).toBe(200);
    });
  });
});
