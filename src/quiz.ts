/*/////////////////////////////////////////////////////////////////////////////
//////////////////////   TOOHAK ITERATION 2 'AUTH.JS'  ////////////////////////
///////////////////////////////////////////////////////////////////////////////

COMP1531 24T2 --- Major Project: `Toohak', 
<https://nw-syd-gitlab.cseunsw.tech/COMP1531/24T2/groups/W11A_
CRUNCHIE/project-backend/-/blob/master/README.md>

This program was written by 
z5478214 | z5599894 | z5525050 | z5362173 | z5478980
on 04/06/2024

quiz.ts contains functions for the Toohak project backend. These functions 
involve the management of quizzes including functionalities such as retrieving ,
updating and deleting quiz information

*//////////////////////////////////////////////////////////////////////////////

// DEPENDENCIES 
import { getData, setData } from './dataStore.js';

// INTERFACES
interface Quiz {
  quizId: number;
  authUserId: number;
  name: string;
  timeCreated: Date;
  timeLastEdited: Date;
  description: string;
}

interface ErrorResponse {
  error : string
}

/** [5] adminQuizNameUpdate
  *
  * Update the name of the relevant quiz.
  *
  * @param {number} authUserId - number representing a unique
  *                              identifier for the user
  * @param {number} quizId - number representing a unique
  *                          identifier for the quiz
  * @param {string} name - string containing the current name of the quiz
  * ...
  * @returns {} - empty object
  *
*/

export function adminQuizNameUpdate(authUserId : number, quizId : number, name : string) : {} | ErrorResponse {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;

  const quiz = quizArr.find(quiz => quiz.quizId === quizId);
  const user = userArr.find(user => user.authUserId === authUserId);
  const findName = quizArr.find(quiz => quiz.name === name && quiz.authUserId === authUserId);
  const quizUser = quizArr.find((quiz) => quiz.authUserId === authUserId);

  if (!quiz) {
    return { error: 'Invalid Quiz id' };
  } else if (!user) {
    return { error: 'Invalid User id' };
  } else if (!quizUser) {
    return { error: 'Quiz Id not owned by the user' };
  } else if (findName) {
    return { error: 'Name is already used' };
  }

  if (name === ' ') {
    return { error: 'Name cannot be empty' };
  } else if (name.length <= 3) {
    return { error: 'Name is too short' };
  } else if (name.length > 30) {
    return { error: 'Name is too long' };
  } else if (/[!-\/:-@[-`{-~]/.test(name)) {
    return { error: 'Quiz name cannot have symbols' };
  }

  quiz.name = name;
  quiz.timeLastEdited = Math.round(Date.now() / 1000);
  setData(store);

  return {};
}