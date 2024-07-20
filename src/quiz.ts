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
import { Answer, Question, Quiz, QuizInfo, QuizList, QuestionId } from './interface';
import { findUserByToken, findQuizById, checkQuizOwnership, validateQuizName, isQuizNameAvailable } from './helper';

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
export function adminQuizList(token: number): {quizzes: QuizList[]} | {error: string} {
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
export function adminQuizCreate(token: number, name: string, description: string): { quizId: number } | { error: string } {
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
export function adminQuizRemove(token: number, quizId: number): Record<string, never> | { error: string } {
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
export function adminQuizInfo(token: number, quizId: number): QuizInfo | { error: string} {
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

export function adminQuizNameUpdate(token: number, quizId: number, name: string): Record<string, never> | { error: string} {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;

  const quiz = findQuizById(quizId, quizArr);
  const user = findUserByToken(token, userArr);
  const quizUser = checkQuizOwnership(token, quizArr);
  const isNameAvailable = isQuizNameAvailable(name, token, quizArr);

  if (!user) {
    return { error: 'Invalid User id' };
  }
  if (!quiz) {
    return { error: 'Invalid Quiz id' };
  }
  if (!quizUser) {
    return { error: 'Quiz Id not owned by the user' };
  }
  if (!isNameAvailable) {
    return { error: 'Name is already used' };
  }

  const nameError = validateQuizName(name);
  if (nameError) {
    return { error: nameError };
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

export function adminQuizDescriptionUpdate(token: number, quizId: number, description: string): Record<string, never> | { error: string } {
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
export function adminQuizTransfer(token: number, quizId : number, userEmail : string) : Record<string, never> | { error: string } {
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

/** [8] adminQuizQuestionCreate
  *
  * Transfers ownership of quiz to a different user
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} quizid     - Id number representing a unique
  *                              identifier for the quiz
  * @param {Question} question -  interface
  * ...
  * @returns {number} questionId
  *
*/
export function adminQuizQuestionCreate(token: number, quizid: number, question: Question): { error: string } | { questionId: number } {
  const data = getData();
  const quizArr = data.quizzes;
  const userArr = data.users;
  const quiz = quizArr.find((q) => q.quizId === quizid);
  const user = userArr.find((user) => user.userId === token);

  if (!user) {
    return { error: 'Invalid Token' };
  }
  if (question.question.length < 5) {
    return { error: 'Question is less than 5 characters' };
  }
  if (question.question.length > 50) {
    return { error: 'Question is more than 50 characters' };
  }
  if (question.answers.length > 6) {
    return { error: 'Question has more than 6 answers' };
  }
  if (question.answers.length < 2) {
    return { error: 'Question has less than 2 answers' };
  }
  if (question.duration < 0) {
    return { error: 'Question duration is not a positive number' };
  }
  if (question.duration > 180) {
    return { error: 'Sum of question durations in quiz exceeds 3 minutes' };
  }
  if (question.points < 1) {
    return { error: 'Question points are less than 1' };
  }
  if (question.points > 10) {
    return { error: 'Question points are more than 10' };
  }
  // in answers array there are 2 answers, we need to check every answer and
  // check its length if its less than 1 or not
  if (question.answers.some((answer) => answer.answer.length < 1)) {
    return { error: 'Answer is less than 1 character' };
  }

  if (question.answers.some((answer) => answer.answer.length > 30)) {
    return { error: 'Answer is more than 30 characters' };
  }
  if (question.answers.some((answer) => question.answers.filter((a) => a.answer === answer.answer).length > 1)) {
    return { error: 'Answers are duplicates' };
  }
  if (!question.answers.some(answer => answer.correct)) {
    return { error: 'No correct answers' };
  }
  if (!quiz) {
    return { error: 'Quiz does not exist' };
  }
  if (quiz.userId !== token) {
    return { error: 'Quiz Id not owned by the user' };
  }

  const id = uniqueQuestionId(quiz.questions);
  const questionBody = {
    questionId: id,
    question: question.question,
    duration: question.duration,
    points: question.points,
    answers: question.answers
  };
  quiz.questions.push(questionBody);
  setData(data);
  return { questionId: id };
}

/** [9] adminQuizQuestion Duplicate
  *
  * Duplicates a question within the same Quiz
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} quizId     - Id number representing a unique
  *                              identifier for the quiz
  * @param {string} questionId - Id number representing a unique
  *                              identifier for the quiz question
  * ...
  * @returns {number} newQuestionId - a new Question id for the duplicated question to differentiate it
  *
*/

export function adminQuizQuestionDuplicate(token : number, quizId: number, questionId: number): QuestionId | { error: string } {
  const store = getData();

  const userArr = store.users;
  const quizArr = store.quizzes;

  const user = userArr.find(user => user.userId === token);
  if (!user) {
    return { error: 'Invalid User id' };
  }
  const quizUser = quizArr.find((quiz) => quiz.userId === token);
  if (!quizUser) {
    return { error: 'Quiz Id not owned by the user' };
  }

  const findQuiz = quizArr.findIndex(quiz => quiz.quizId === quizId);
  if (findQuiz === -1) {
    return { error: 'Invalid Quiz id' };
  }
  const quiz = store.quizzes[findQuiz];

  const findQuestion = store.quizzes[findQuiz].questions.findIndex(question => question.questionId === questionId);
  if (findQuestion === -1) {
    return { error: 'Question id does not refer to valid question in quiz' };
  }

  const question = quizArr[findQuiz].questions[findQuestion];
  const newQuestionId = uniqueQuestionId(quiz.questions);

  quiz.timeLastEdited = Math.round(Date.now() / 1000);

  const duplicatedQuestion = {
    questionId: newQuestionId,
    question: question.question,
    duration: question.duration,
    points: question.points,
    answers: question.answers
  };

  quiz.questions.push(duplicatedQuestion);
  setData(store);
  return { questionId: newQuestionId };
}

/** [10] adminQuizQuestionDelete
  *
  * Duplicates a question within the same Quiz
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} quizId     - Id number representing a unique
  *                              identifier for the quiz
  * @param {string} questionId - Id number representing a unique
  *                              identifier for the quiz question
  * ...
  * @returns {} - empty object
  *
*/
export function adminQuizQuestionDelete(token: number, quizId: number, questionId: number): Record<string, never> | { error: string } {
  const store = getData();
  const quizArr = store.quizzes;
  const userArr = store.users;
  const quiz = quizArr.find((quiz) => quiz.quizId === quizId);
  const user = userArr.find((user) => user.userId === token);

  if (!user) {
    return { error: 'Invalid Token' };
  }
  if (!quiz) {
    return { error: 'Invalid Quiz Id' };
  }
  if (quiz.userId !== token) {
    return { error: 'Quiz Id not owned by the user' };
  }
  const question = quiz.questions.find((question: Question) => question.questionId === questionId);
  if (!question) {
    return { error: 'Invalid Question Id' };
  }
  const index = quiz.questions.indexOf(question);
  quiz.questions.splice(index, 1);
  setData(store);
  return {};
}

// function to create a random id everytime
function uniqueQuestionId(questArr: Question[]): number {
  let uId: number;
  do {
    uId = Date.now();
  } while (questArr.find(quiz => (quiz.questionId === uId)));
  return uId;
}

/** [11] adminQuizTrashView.test.ts
  *
  * Returns list of quizzes in trash with basic info
  *
  * * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * ...
  * @returns {array} quizzes
  *
*/
export function adminQuizTrashView(token: string): {quizzes: QuizList[] } {
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

/** [12] adminQuizQuestionUpdate
  *
  * Duplicates a question within the same Quiz
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} quizId     - Id number representing a unique
  *                              identifier for the quiz
  * @param {string} questionId - Id number representing a unique
  *                              identifier for the quiz question
  * ...
  * @returns {} - empty object
  *
*/
export function adminQuizQuestionUpdate (token: number, quizId: number, questionId: number,
  questionBody:
    {
      question: string,
      duration: number,
      points: number,
      answers:Answer[]
    }
) : Record<string, never> | { error: string } {
  const data = getData();
  const user = data.users.find(user => user.userId === token);

  if (!user) {
    return { error: 'invalid token' };
  }
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    return { error: 'quiz does not exist for this user' };
  }
  const quiz = data.quizzes[quizIndex];
  if (!quiz) {
    return { error: 'quiz does not exist for this user' };
  }

  if (quiz.userId !== token) {
    return { error: 'quiz does not exist for this user' };
  }

  if (!doesQuestionExistInQuiz(quiz.questions, questionId)) {
    return { error: 'question id does not exist in this quiz' };
  }

  const question = quiz.questions.find(question => question.questionId === questionId);
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  if (!question) {
    return { error: 'question id does not exist in this quiz' };
  }

  if (questionBody.question.length < 5) {
    return { error: 'question is too short' };
  }
  if (questionBody.question.length > 50) {
    return { error: 'question is too long' };
  }
  if (questionBody.answers.length > 6) {
    return { error: 'question has too many answers' };
  }
  if (questionBody.answers.length < 2) {
    return { error: 'question does not have enough answers' };
  }
  if (questionBody.duration < 0 || typeof (questionBody.duration) !== 'number') {
    return { error: 'duration is not a positive number' };
  }
  let duration = 0;

  // Iterate over the questions array to sum up the durations
  for (let i = 1; i < quiz.questions.length; i++) {
    duration += quiz.questions[i].duration;
  }
  duration -= question.duration;
  duration += questionBody.duration;

  if (duration > 180) {
    return { error: 'total duration of quiz is too long' };
  }
  if (questionBody.points < 1 || typeof (questionBody.points) !== 'number') {
    return { error: 'points is not a positive number' };
  }
  if (questionBody.points > 10) {
    return { error: 'points awarded is too big' };
  }
  if (questionBody.answers.some((answer) => answer.answer.length < 1)) {
    return { error: 'answer is too short' };
  }
  if (questionBody.answers.some((answer) => answer.answer.length > 30)) {
    return { error: 'answer is too long' };
  }
  if (questionBody.answers.some((answer) => questionBody.answers.filter((a) => a.answer === answer.answer).length > 1)) {
    return { error: 'question contains a duplicate answer' };
  }
  if (!questionBody.answers.some(answer => answer.correct)) {
    return { error: 'no correct answer for this question' };
  }

  const quest: Question = quiz.questions[questionIndex];
  quest.question = questionBody.question;
  quest.duration = questionBody.duration;
  quest.points = questionBody.points;
  quest.answers = questionBody.answers;
  quiz.timeLastEdited = Math.round(Date.now() / 1000);

  setData(data);
  return {};
}

/** [13] adminQuizQuestionMove
  *
  * Duplicates a question within the same Quiz
  *
  * @param {number} token - Id number representing a unique
  *                              identifier for the user
  * @param {number} questionId    - Id number representing a unique
  *                              identifier for the question
  * @param {string} newPosition - newPosition
  *
  * ...
  * @returns {} - empty object
  *
*/
export function adminQuizQuestionMove(token: number, quizId: number, questionId: number, newPosition: number): Record<string, never> | { error: string } {
  const data = getData();
  const user = data.users.find(user => user.userId === token);

  if (!user) {
    return { error: 'invalid token' };
  }
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    return { error: 'quiz does not exist for this user' };
  }

  const quiz = data.quizzes[quizIndex];
  if (!quiz) {
    return { error: 'quiz does not exist for this user' };
  }

  if (quiz.userId !== token) {
    return { error: 'quiz does not exist for this user' };
  }

  if (!doesQuestionExistInQuiz(quiz.questions, questionId)) {
    return { error: 'question id does not exist in this quiz' };
  }

  const question = quiz.questions.find(question => question.questionId === questionId);
  if (!question) {
    return { error: 'question id does not exist in this quiz' };
  }

  if (newPosition < 0) {
    return { error: 'position value is less than zero' };
  }

  if (quiz.questions.indexOf(question) === newPosition) {
    return { error: 'new position is current position' };
  }

  if (newPosition > quiz.questions.length - 1) {
    return { error: 'new position is too big' };
  }

  quiz.timeLastEdited = Math.round(Date.now() / 1000);
  quiz.questions.splice(quiz.questions.indexOf(question), 1);
  quiz.questions.splice(newPosition, 0, question);
  setData(data);
  return {};
}

// Helper function to check if a question exists in the quiz
function doesQuestionExistInQuiz(quesArr: Question[], questionId: number | {error: string}): boolean {
  return quesArr.some(question => question.questionId === questionId);
}

/** [14] adminQuizTrashEmpty
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
export function adminQuizTrashEmpty(token: number, quizIds: number[]): Record<string, never> | { error: string } {
  const store = getData();

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

/** [15] adminQuizTrashRestore
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
export function adminQuizTrashRestore(token: number, quizId: number): Record<string, never> | { error: string } {
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
