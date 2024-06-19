import { clear } from './other.js';

beforeEach(() => {
  clear();
});

describe("clear Function Tests", () => {
  describe("Success Cases", () => {
    test('Clear function should return an empty object', () => {
      const result = clear();
      expect(result).toEqual({});
    });

    test.each([
      ['first call'],
      ['second call'],
      ['third call']
    ])('Clear function should return an empty object on %s', (callEmpty) => {
      const result = clear();
      expect(result).toEqual({});
    });

    test('Clear function should not throw errors when called multiple times', () => {
      expect(() => clear()).not.toThrow();
      expect(() => clear()).not.toThrow();
      expect(() => clear()).not.toThrow();
    });
  });
});

describe("Error Cases", () => {
  test('Clear function should handle undefined or null input', () => {
    const result = clear(undefined);
    expect(result).toEqual({});
<<<<<<< HEAD
    
    const result2 = clear(null);
    expect(result2).toEqual({});
  });

  test('Clear function should throw an error with invalid input types', () => {
    expect(() => clear(123)).toThrow();
    expect(() => clear("invalid")).toThrow();
    expect(() => clear({})).toThrow();
    expect(() => clear([])).toThrow();
  });
=======
    const result2 = clear(null);
    expect(result2).toEqual({});
  });
>>>>>>> e8429b159a68c0341cc9afb375f1d58f0a16b4d4
});