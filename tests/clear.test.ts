import request from 'sync-request-curl';
import { port, url } from '../src/config.json';const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear');
});

describe('clear Function Tests', () => {
  describe('Success Cases', () => {
    test('Clear function should return an empty object', () => {
      const result = request('DELETE', SERVER_URL + '/v1/clear');
      expect(result).toEqual({});
    });

    test.each([
      ['first call'],
      ['second call'],
      ['third call']
    ])('Clear function should return an empty object on %s', (callEmpty) => {
      const result = request('DELETE', SERVER_URL + '/v1/clear');
      expect(result).toEqual({});
    });

    test('Clear function should not throw errors when called multiple times', () => {
      expect(() => request('DELETE', SERVER_URL + '/v1/clear')).not.toThrow();
      expect(() => request('DELETE', SERVER_URL + '/v1/clear')).not.toThrow();
      expect(() => request('DELETE', SERVER_URL + '/v1/clear')).not.toThrow();
    });
  });
});

describe('Error Case', () => {
  test('Clear function should handle undefined or null input', () => {
    const result = request('DELETE', SERVER_URL + '/v1/clear');(undefined);
    expect(result).toEqual({});

    const result2 = request('DELETE', SERVER_URL + '/v1/clear');(null);
    expect(result2).toEqual({});
  });
});