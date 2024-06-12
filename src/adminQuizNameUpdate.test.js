import { adminQuizNameUpdate } from './quiz.js';
import { clear } from './other.js';

test ("Quiz does not match name", () =>{
  clear();
  let name = adminQuizNameUpdate("Mubashir");
  expect(name).toStrictEqual( {error : "Quiz does not exist with such name"});
});

test ("Name cannot be empty", () =>{
  clear();
  let name = adminQuizNameUpdate(" ");
  expect(name).toStrictEqual( {error : "Name cannot be empty when updating"});
});

test ("Invalid User id", () => {
  clear();
  let authUserId = adminQuizNameUpdate(1);
  expect(authUserId).toStrictEqual( {error : "Invalid User id"});
});

test ("Check fail on short names", () => {
  clear();
  let name1 = adminQuizNameUpdate("a");
  expect(name1).toStrictEqual ({ error : "Name is too short"});

  let name2 = adminQuizNameUpdate("ab");
  expect(name2).toStrictEqual ({ error : "Name is too short"});
});

