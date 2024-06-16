// Nafis Function 12 Tests:
import { clear } from './other.js';

// Test to ensure the clear function returns an empty object
test('Clear function should return an empty object', () => {
    const result = clear();
    expect(result).toEqual({});
  });

// Test to ensure the clear function can be called multiple times
test.each([
    ['first call'],
    ['second call'],
    ['third call']
  ])('Clear function should return an empty object on %s', (callEmpty) => {
    const result = clear();
    expect(result).toEqual({});
  });

// Test to ensure clear function does not throw errors
test('Clear function should not throw errors when called multiple times', () => {
  expect(() => clear()).not.toThrow();
  expect(() => clear()).not.toThrow();
  expect(() => clear()).not.toThrow();
});