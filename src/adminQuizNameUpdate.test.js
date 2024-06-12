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
  expect(name).toStrictEqual( {error : "Name cannot be empty when updating"})
});