/*
/////////////////////////////////////////////////////////////////////////////
//////////////////////   TOOHAK ITERATION 2 'QUIZ.TS'  ////////////////////////
///////////////////////////////////////////////////////////////////////////////

COMP1531 24T2 --- Major Project: `Toohak',
<https://nw-syd-gitlab.cseunsw.tech/COMP1531/24T2/groups/W11A_
CRUNCHIE/project-backend/-/blob/master/README.md>

This program was written by
z5478214 | z5599894 | z5525050 | z5362173 | z5478980
on 04/06/2024

quiz.js contains the functions for the implementation of quiz mechanics
in the Toohak project. This includes functions that create, remove, list
and update information regarding quizzes.

*/// ///////////////////////////////////////////////////////////////////////////

// DEPENDENCIES

import { getData, setData } from './dataStore';
import { Quiz, QuizInfo, QuizList, ErrorResponse } from './interface';

/// ////////////////////////////////////////////////////////////////////////////

/** [1] adminQuizList
  *
  * Provides a list of all quizzes that are owned by the currently
  * logged in user.
  *
  * @param {number} token - number representing a unique
  *                              identifier for the user
  * ...
  * @returns {
  *   quizzes : [
  *     {
  *      quizId: number,
  *      name: string,
  *     }
  *   ]
  * } - an array containing the names of all quizzes and their quizIds
  *
*/
export function adminQuizList(token: number): {quizzes: QuizList[]} | ErrorResponse {
  const data = getData();
  const user = data.users.find(user => user.userId === token);

  if (!user) {
    return { error: 'invalid user id' };
  }
  const result: QuizList[] = [];

  const userQuizzes = data.quizzes.filter(quiz => quiz.userId === token);
  for (const item of userQuizzes) {
    result.push({
      quizId: item.quizId,
      name: item.name
    });
  }
  return { quizzes: result };
}

/** [2] adminQuizCreate
  *
  * Given basic details about a new quiz, create one for the logged in user.
  *
  * @param {number} token - number representing a unique
  *                              identifier for the user
  * @param {string} name - string containing the name of the quiz
  *
  * @param {string} description - string containing description of the quiz
  * ...
  * @returns {quizId: number} - number representing a unique
  *                             identifier for the quiz
  *
*/
export function adminQuizCreate(token: number, name: string, description: string): { quizId: number } | ErrorResponse {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;
  const user = userArr.find((user) => {
    return user.userId === token;
  });

  if (!user) return { error: 'Invalid token' };

  const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '{', '}', '[', ']',
    ':', ';', '-', '"', "'", '<', '>', '.', '?', '/', '|', '\\'];
  for (let i = 0; i < specialChars.length; i++) {
    if (name.includes(specialChars[i])) {
      return { error: 'Name contains invalid characters' };
    }
  }
  if (name.length < 3) {
    return { error: 'name is less than 3 characters' };
  }
  if (name.length > 30) {
    return { error: 'name is more than 30 characters' };
  }
  if (description.length > 100) {
    return { error: 'Description is more than 100 characters in length' };
  }
  if (quizArr.find((quiz) => quiz.name === name && quiz.userId === token)) {
    return { error: 'Name is already used by current logged in user' };
  }

  const id = uniqueQuizId(quizArr);
  const quiz: Quiz = {
    quizId: id,
    name: name,
    description: description,
    timeCreated: Math.round(Date.now() / 1000),
    timeLastEdited: Math.round(Date.now() / 1000),
    numQuestions: 0,
    questions: [],
    duration: 0,
    userId: token,
  };
  store.quizzes.push(quiz);
  setData(store);
  return { quizId: id };
}

// function to create a random id everytime
function uniqueQuizId(quizArr: Quiz[]): number {
  let uId: number;
  do {
    uId = Date.now();
  } while (quizArr.find(quiz => (quiz.quizId === uId)));
  return uId;
}

/** [3] adminQuizRemove
  *
  * Given a particular quiz, permanently remove the quiz.
  *
  * @param {number} token - number representing a unique
  *                              identifier for the user
  * @param {number} quizId - number representing a unique
  *                          identifier for the quiz
  * ...
  * @returns {} - empty object
  *
*/
export function adminQuizRemove(token: number, quizId: number): Record<string, never> | ErrorResponse {
  const store = getData();
  const quizArray = store.quizzes;
  const userArray = store.users;
  const user = userArray.find((user) => { return user.userId === token; });
  const quiz = quizArray.find((quiz) => { return quiz.quizId === quizId; });
  if (!user) {
    return { error: 'Invalid user id' };
  }
  if (!quiz) {
    return { error: 'Invalid quiz Id entered' };
  }
  if (quiz.userId !== token) {
    return { error: 'Quiz Id not owned by the user' };
  }

  quiz.timeLastEdited = Math.round(Date.now() / 1000);
  store.trash.push(quiz);
  const index = quizArray.indexOf(quiz);
  quizArray.splice(index, 1);
  store.quizzes = quizArray;
  setData(store);
  return {};
}

/** [4] adminQuizInfo
  *
  * Gets all of the relevant information about the current quiz.
  *
  * @param {number} token - number representing a unique
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
export function adminQuizInfo(token: number, quizId: number): QuizInfo | ErrorResponse {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;
  const quiz = quizArr.find((quiz) => quiz.quizId === quizId);
  const user = userArr.find((user) => user.userId === token);
  const userQuiz = quizArr.find((quiz) => quiz.userId === token);

  if (!user) {
    return { error: 'Invalid User id' };
  } else if (!quiz) {
    return { error: 'Invalid Quiz id' };
  } else if (!userQuiz) {
    return { error: 'This Quiz Id does not refer to a quiz that this user owns' };
  }

  const filteredQuestions = quiz.questions.filter(q => q !== null);
  const totalDuration = quiz.questions.reduce((acc, question) => acc + question.duration, 0);

  const quizInfo: QuizInfo = {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    // Update numQuestions based on filtered questions
    numQuestions: filteredQuestions.length - 1,
    questions: filteredQuestions,
    duration: totalDuration
  };
  return quizInfo;
}

/** [5] adminQuizNameUpdate
  *
  * Update the name of the relevant quiz.
  *
  * @param {number} token - number representing a unique
  *                              identifier for the user
  * @param {number} quizId - number representing a unique
  *                          identifier for the quiz
  * @param {string} name - string containing the current name of the quiz
  * ...
  * @returns {} - empty object
  *
*/
export function adminQuizNameUpdate(token: number, quizId: number, name: string): Record<string, never> | ErrorResponse {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;
  const quiz = quizArr.find(quiz => quiz.quizId === quizId);
  const user = userArr.find(user => user.userId === token);
  const findName = quizArr.find(quiz => quiz.name === name && quiz.userId === token);
  const quizUser = quizArr.find((quiz) => quiz.userId === token);

  if (!user) {
    return { error: 'Invalid User id' };
  } else if (!quiz) {
    return { error: 'Invalid Quiz id' };
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
  } else if (/[!-:-@[-`{-~]/.test(name)) {
    return { error: 'Quiz name cannot have symbols' };
  }

  quiz.name = name;
  quiz.timeLastEdited = Math.round(Date.now() / 1000);
  setData(store);
  return {};
}

/** [6] adminQuizDescriptionUpdate
  *
  * Update The description of the relevant quiz.
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} quizId     - Id number representing a unique
  *                              identifier for the quiz
  * @param {string} description - a string containing the current
  *                               description of the quiz
  * ...
  * @returns {} - empty object if successful
*/

// My constant define for the 'Description is more than 100 characters' test case
const MAX_DESCRIPTION_LENGTH = 100;

export function adminQuizDescriptionUpdate(token: number, quizId: number, description: string): Record<string, never> | ErrorResponse {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;

  // These two lines finds the Tahook user with both a valid userId and quidId
  const user = userArr.find((user) => user.userId === token);
  const quiz = quizArr.find((quiz) => quiz.quizId === quizId);

  // Check if the quiz is owned by the user with the given UserId
  const quizUser = quizArr.find((quiz) => quiz.userId === token);

  // Error messages returned if the error tests cases are activated within the program
  // If a person's Tahook quiz does not match the userId, an error will then be returned
  if (!quizUser) {
    return { error: 'Quiz Id not owned by the user' };
  }

  // Check if description is empty
  if (description.length === 0) {
    return { error: 'Quiz description cannot be empty' };
  }
  // If the description length exceeds 100 characters, return an error
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: 'Quiz description is more than 100 characters in length' };
  }

  if (!user) {
    return { error: 'userId does not exist' };
  } else if (!quiz) {
    return { error: 'Quiz Id not found' };
  } else {
    quiz.description = description;
    quiz.timeLastEdited = Math.round(Date.now() / 1000);
    setData(store);
    return {};
  }
}

/** [7] adminQuizTransfer
  *
  * Transfers ownership of quiz to a different user
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} quizId     - Id number representing a unique
  *                              identifier for the quiz
  * @param {string} userEmail - a string containing the emaill of user
  * ...
  * @returns {} - empty object if successful
  *
*/
export function adminQuizTransfer(token: number, quizId : number, userEmail : string) : Record<string, never> | ErrorResponse {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;

  const findQuiz = quizArr.findIndex(quiz => quiz.quizId === quizId);
  if (findQuiz === -1) {
    return { error: 'Invalid Quiz id' };
  }

  const quiz = store.quizzes[findQuiz];
  const user = userArr.find(user => user.userId === token);
  const quizUser = quizArr.find((quiz) => quiz.userId === token);

  const targetUser = store.users.find(user => user.email === userEmail);
  if (!targetUser) {
    return { error: 'Target user email is not a real user' };
  }
  const isQuizExists = store.quizzes.some(q => ((q.name === quiz.name) && (q.userId === targetUser.userId)));

  if (!user) {
    return { error: 'Invalid User id' };
  } else if (findQuiz === -1) {
    return { error: 'Invalid Quiz id' };
  } else if (!quizUser) {
    return { error: 'Quiz Id not owned by the user' };
  } else if (user.userId === targetUser.userId) {
    return { error: 'Target user email is the same as currently logged in user' };
  } else if (isQuizExists) {
    return { error: 'Quiz name already in use by target user' };
  }
  // Change the quiz authuser id so it has the authuser id of the new owner
  quiz.userId = targetUser.userId;
  return {};
}

/** [8] adminQuizTrashView.test.ts
  *
  * Returns list of quizzes in trash with basic info
  *
  * * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * ...
  * @returns {array} quizzes
  *
*/
export function adminQuizTrashView(token: string): {quizzes: QuizList[] } | ErrorResponse {
  const store = getData();
  const trash = store.trash;
  const result = [];

  for (const item of trash) {
    result.push({
      quizId: item.quizId,
      name: item.name,
    });
  }
  return ({ quizzes: result });
}

/** [9] adminQuizTrashEmpty
  *
  * Duplicates a question within the same Quiz
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} quizIds   - Ids consisting of quizIds a
  *
  * ...
  * @returns {} - empty object
  *
*/
export function adminQuizTrashEmpty(token: number, quizIds: number[]): Record<string, never> | ErrorResponse {
  const store = getData();

  // checking if all quizzes exist in the system
  for (const item of quizIds) {
    const quiz = store.quizzes.find(x => x.quizId === item) || store.trash.find(x => x.quizId === item);
    if (!quiz) {
      return { error: 'Some quizzes do not exist' };
    }
  }

  // checking if all quizzes are in trash
  for (const item of quizIds) {
    const quiz = store.trash.find(x => x.quizId === item);
    if (!quiz) {
      return { error: 'Some quizzes are not in the trash' };
    }
  }

  // checking if all quizzes are owned by user
  for (const item of quizIds) {
    const quiz = store.trash.find(x => x.quizId === item);
    if (quiz.userId !== token) {
      return { error: 'Some quizzes are not owned by the user' };
    }
  }

  store.trash = store.trash.filter(quiz => !quizIds.includes(quiz.quizId));
  return {};
}

/** [10] adminQuizTrashRestore
  *
  * Restores a quiz from the trash
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} quizId     - Id number representing a unique
  *                              identifier for the quiz
  * @returns {} - empty object if successful
  *
*/
export function adminQuizTrashRestore(token: number, quizId: number): Record<string, never> | ErrorResponse {
  const store = getData();
  const quizArray = store.quizzes;
  const trashArray = store.trash;
  const userArray = store.users;

  // Checking if the userId is valid
  const user = userArray.find((user) => user.userId === token);
  if (!user) {
    return { error: 'invalid token' };
  }

  // Finding the quiz in the quizzes array
  const quizIndex = quizArray.findIndex((quiz) => quiz.quizId === quizId);
  if (quizIndex === -1) {
    return { error: 'quiz does not exist for this user' };
  }

  // Ensuring the quiz belongs to the authenticated user
  const quiz = quizArray[quizIndex];
  if (quiz.userId !== token) {
    return { error: 'Quiz Id not owned by the user' };
  }

  // Move quiz from quizzes to trash
  quizArray.push(quiz);
  quizArray.splice(quizIndex, 1);
  store.quizzes = quizArray;
  store.trash = trashArray;
  setData(store);

  return {};
}