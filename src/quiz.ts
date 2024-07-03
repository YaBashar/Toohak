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
involve the management of quizzes created by the user including functionality such as
updating , retrieving and deleting quiz information. 

*//////////////////////////////////////////////////////////////////////////////

// DEPENDENCIES 
import { getData, setData } from './dataStore.js';

// INTERFACES
interface QuizInfo {
  quizId: number;
  name: string;
  timeCreated: Date;
  timeLastEdited: Date;
  description: string;
}

interface ErrorResponse {
  error: string;
}

/** [4] adminQuizInfo
  *
  * Gets all of the relevant information about the current quiz.
  *
  * @param {number} authUserId - number representing a unique
  *                              identifier for the user
  * @param {number} quizId - number representing a unique
  *                          identifier for the quiz
  * ...
  * @returns {
*   quizId: number,
*   name: string,
*   timeCreated: number,
*   timeLastEdited: number,
*   description: string,
* } - an object with information about the quiz based on the quizId
*
*/

export function adminQuizInfo(authUserId : number, quizId : number) : QuizInfo | ErrorResponse {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;

  const quiz = quizArr.find((quiz) => quiz.quizId === quizId);
  const user = userArr.find((user) => user.authUserId === authUserId);
  const userQuiz = quizArr.find((quiz) => quiz.authUserId === authUserId);

  if (!quiz) {
    return { error : 'Invalid Quiz id' };
  } else if (!user) {
    return { error: 'Invalid User id' };
  } else if (!userQuiz) {
    return { error: 'This Quiz Id does not refer to a quiz that this user owns' };
  }

  return {
    quizId: quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description
  };
}
